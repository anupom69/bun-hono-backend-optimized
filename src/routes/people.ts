import { Hono } from "hono";
import { prisma } from "../utils/prismaClient";
import { basicAuth } from "hono/basic-auth";

const peopleRoutes = new Hono().use(
  basicAuth({
    username: Bun.env.USERNAME || "user",
    password: Bun.env.PASSWORD || "pass",
  })
);

peopleRoutes.get("/all", async (c) => {
  try {
    const people = await prisma.people.findMany({
      orderBy: {
        name: "asc",
      },
    });
    return c.json(people, 200);
  } catch (error) {
    console.error("Error fetching people:", error);
    return c.json({ message: "Failed to fetch people" }, 500);
  }
});

// Create People
peopleRoutes.post("/create-one", async (c) => {
  try {
    const { name, phone } = await c.req.json();
    if (!name || !phone) {
      return c.json({ message: "Missing required fields" }, 400);
    }
    if (phone.length !== 13) {
      return c.json({ message: "Invalid phone number" }, 400);
    }
    await prisma.people.create({
      data: {
        name,
        phone,
      },
    });
    return c.json({ message: "Person created successfully" }, 200);
  } catch (error) {
    console.error("Error creating person:", error);
    return c.json({ message: "Failed to create person" }, 500);
  }
});

// Read People
peopleRoutes.get("/read-one/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const data = await prisma.people.findUnique({
      where: {
        id,
      },
    });
    return c.json(data, 200);
  } catch (error) {
    console.error("Error fetching person:", error);
    return c.json({ message: "Failed to fetch person" }, 500);
  }
});

// Update People
peopleRoutes.post("/update-one/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const { name, phone } = await c.req.json();
    await prisma.people.update({
      where: { id: id },
      data: {
        name,
        phone,
      },
    });
    return c.json({ message: "Person updated successfully" }, 200);
  } catch (error) {
    console.error("Error updating person:", error);
    return c.json({ message: "Failed to update person" }, 500);
  }
});

// Delete People
peopleRoutes.post("/delete-one/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await prisma.people.delete({
      where: { id: id },
    });
    return c.json({ message: "Person deleted successfully" }, 200);
  } catch (error) {
    console.error("Error deleting person:", error);
    return c.json({ message: "Failed to delete person" }, 500);
  }
});

export { peopleRoutes };
