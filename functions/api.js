const crypto = require("crypto");
const { getStore } = require("@netlify/blobs");

const stores = () => ({
  usersStore: getStore("users"),
  dataStore: getStore("user-data"),
  usageStore: getStore("usage"),
});

const json = (statusCode, body) => ({
  statusCode,
  headers: {
    "content-type": "application/json",
    "cache-control": "no-store",
  },
  body: JSON.stringify(body),
});

const parseBody = (event) => {
  if (!event.body) return {};
  try {
    return JSON.parse(event.body);
  } catch {
    return {};
  }
};

const getJson = async (store, key, fallback) => {
  const value = await store.get(key, { type: "json" });
  return value || fallback;
};

const setJson = (store, key, value) => store.setJSON(key, value);

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

const hashPassword = (password, salt = crypto.randomBytes(16).toString("hex")) => {
  const hash = crypto.pbkdf2Sync(String(password), salt, 120000, 32, "sha256").toString("hex");
  return `${salt}:${hash}`;
};

const verifyPassword = (password, stored) => {
  if (!stored || !stored.includes(":")) return false;
  const [salt, expected] = stored.split(":");
  const actual = hashPassword(password, salt).split(":")[1];
  return crypto.timingSafeEqual(Buffer.from(actual), Buffer.from(expected));
};

const secret = () => process.env.JWT_SECRET || process.env.NETLIFY_SITE_ID || "local-dev-secret-change-me";

const signToken = (payload) => {
  const body = {
    ...payload,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 14,
  };
  const encoded = Buffer.from(JSON.stringify(body)).toString("base64url");
  const signature = crypto.createHmac("sha256", secret()).update(encoded).digest("base64url");
  return `${encoded}.${signature}`;
};

const verifyToken = (token) => {
  if (!token || !token.includes(".")) return null;
  const [encoded, signature] = token.split(".");
  const expected = crypto.createHmac("sha256", secret()).update(encoded).digest("base64url");
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
  if (payload.exp < Date.now()) return null;
  return payload;
};

const currentUser = async (event, usersStore) => {
  const header = event.headers.authorization || event.headers.Authorization || "";
  const token = header.replace(/^Bearer\s+/i, "");
  const session = verifyToken(token);
  if (!session) return null;
  const users = await getJson(usersStore, "users.json", []);
  return users.find((user) => user.id === session.id) || null;
};

const logUsage = async (usageStore, entry) => {
  const usage = await getJson(usageStore, "events.json", []);
  usage.unshift({ ...entry, at: new Date().toISOString() });
  await setJson(usageStore, "events.json", usage.slice(0, 500));
};

const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  status: user.status,
  createdAt: user.createdAt,
  approvedAt: user.approvedAt,
  lastLoginAt: user.lastLoginAt,
});

exports.handler = async (event) => {
  try {
    const { usersStore, dataStore, usageStore } = stores();
    const path = event.path.replace(/^\/\.netlify\/functions\/api|^\/api/, "") || "/";
    const method = event.httpMethod;
    const body = parseBody(event);

    if (method === "GET" && path === "/ping") {
      return json(200, { ok: true, message: "API is running." });
    }

  if (method === "POST" && path === "/register") {
    const email = normalizeEmail(body.email);
    const password = String(body.password || "");
    const name = String(body.name || "").trim();
    if (!email || password.length < 8) return json(400, { error: "Email and an 8+ character password are required." });

    const users = await getJson(usersStore, "users.json", []);
    if (users.some((user) => user.email === email)) return json(409, { error: "An account already exists for that email." });

    const adminEmail = normalizeEmail(process.env.ADMIN_EMAIL);
    const isFirstUser = users.length === 0;
    const isAdmin = isFirstUser || (adminEmail && email === adminEmail);
    const user = {
      id: crypto.randomUUID(),
      name,
      email,
      passwordHash: hashPassword(password),
      role: isAdmin ? "admin" : "user",
      status: isAdmin ? "approved" : "pending",
      createdAt: new Date().toISOString(),
      approvedAt: isAdmin ? new Date().toISOString() : null,
      lastLoginAt: null,
    };
    users.push(user);
    await setJson(usersStore, "users.json", users);
    await logUsage(usageStore, { type: "register", userId: user.id, email, status: user.status });
    return json(200, { user: publicUser(user), needsApproval: user.status !== "approved" });
  }

  if (method === "POST" && path === "/login") {
    const email = normalizeEmail(body.email);
    const users = await getJson(usersStore, "users.json", []);
    const user = users.find((candidate) => candidate.email === email);
    if (!user || !verifyPassword(body.password, user.passwordHash)) return json(401, { error: "Login failed." });
    if (user.status !== "approved") return json(403, { error: "Your account is waiting for admin approval." });
    user.lastLoginAt = new Date().toISOString();
    await setJson(usersStore, "users.json", users);
    await logUsage(usageStore, { type: "login", userId: user.id, email: user.email });
    return json(200, { token: signToken({ id: user.id, role: user.role }), user: publicUser(user) });
  }

  if (method === "POST" && path === "/password-reset-request") {
    const email = normalizeEmail(body.email);
    const users = await getJson(usersStore, "users.json", []);
    const user = users.find((candidate) => candidate.email === email);
    await logUsage(usageStore, { type: "password-reset-request", userId: user ? user.id : null, email });
    return json(200, { ok: true });
  }

  const user = await currentUser(event, usersStore);
  if (!user) return json(401, { error: "Authentication required." });

  if (method === "GET" && path === "/me") return json(200, { user: publicUser(user) });

  if (method === "GET" && path === "/data") {
    const data = await getJson(dataStore, `${user.id}.json`, {});
    return json(200, { data });
  }

  if (method === "POST" && path === "/data") {
    await setJson(dataStore, `${user.id}.json`, body.data || {});
    await logUsage(usageStore, { type: "save-data", userId: user.id, email: user.email });
    return json(200, { ok: true });
  }

  if (user.role !== "admin") return json(403, { error: "Admin access required." });

  if (method === "GET" && path === "/admin/users") {
    const users = await getJson(usersStore, "users.json", []);
    return json(200, { users: users.map(publicUser) });
  }

  if (method === "GET" && path === "/admin/usage") {
    const usage = await getJson(usageStore, "events.json", []);
    return json(200, { usage });
  }

  if (method === "POST" && path === "/admin/approve") {
    const users = await getJson(usersStore, "users.json", []);
    const target = users.find((candidate) => candidate.id === body.userId);
    if (!target) return json(404, { error: "User not found." });
    target.status = "approved";
    target.approvedAt = new Date().toISOString();
    await setJson(usersStore, "users.json", users);
    await logUsage(usageStore, { type: "approve-user", adminId: user.id, userId: target.id, email: target.email });
    return json(200, { user: publicUser(target) });
  }

  if (method === "POST" && path === "/admin/reset-password") {
    const users = await getJson(usersStore, "users.json", []);
    const target = users.find((candidate) => candidate.id === body.userId);
    if (!target) return json(404, { error: "User not found." });
    if (!body.newPassword || String(body.newPassword).length < 8) return json(400, { error: "New password must be at least 8 characters." });
    target.passwordHash = hashPassword(body.newPassword);
    await setJson(usersStore, "users.json", users);
    await logUsage(usageStore, { type: "admin-password-reset", adminId: user.id, userId: target.id, email: target.email });
    return json(200, { ok: true });
  }

  return json(404, { error: "Not found." });
  } catch (error) {
    console.error(error);
    return json(500, {
      error: "Server error.",
      details: error.message,
    });
  }
};
