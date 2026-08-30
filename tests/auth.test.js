const request = require("supertest");
const app = require("../src/app");
const { connectTestDB, closeTestDB, clearTestDB } = require("../src/config/db.test-setup");

beforeAll(async () => {
    await connectTestDB();
});

afterEach(async () => {
    await clearTestDB();
});

afterAll(async () => {
    await closeTestDB();
});

describe("POST /api/auth/register", () => {
    const validUser = {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        phone: "01000000000",
    };

    it("registers a new user successfully", async () => {
        const res = await request(app).post("/api/auth/register").send(validUser);

        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.user).toBeDefined();
        expect(res.body.user.email).toBe(validUser.email);
        expect(res.body.user.password).toBeUndefined(); // password must never come back
    });

    it("rejects a duplicate email", async () => {
        await request(app).post("/api/auth/register").send(validUser);
        const res = await request(app).post("/api/auth/register").send(validUser);

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.msg).toMatch(/already exists/i);
    });

    it("rejects an invalid email format", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({ ...validUser, email: "not-an-email" });

        expect(res.statusCode).toBe(400);
    });
});

describe("POST /api/auth/login", () => {
    const validUser = {
        name: "Test User",
        email: "login@example.com",
        password: "password123",
        phone: "01000000000",
    };

    beforeEach(async () => {
        await request(app).post("/api/auth/register").send(validUser);
    });

    it("logs in with correct credentials", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({ email: validUser.email, password: validUser.password });

        expect(res.statusCode).toBe(200);
        expect(res.body.token).toBeDefined();
    });

    it("rejects wrong password", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({ email: validUser.email, password: "wrongpassword" });

        expect(res.statusCode).toBe(401);
    });

    it("rejects a non-existent email", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({ email: "nobody@example.com", password: "password123" });

        expect(res.statusCode).toBe(401);
    });
});