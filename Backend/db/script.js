import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import { UsersTable, PollTable, OptionTable, VoteTable } from "./schema.js";

const db = drizzle(process.env.DATABASE_URL);

async function main() {
  // const user = {
  //   name: "John",
  //   email: "john@example.com",
  //   password: "1234567890",
  // };

  // await db.insert(UsersTable).values(user);
  // console.log("New user created!");

  // const poll = {
  //   question: "What is the capital of India",
  //   userId: 1,
  // };

  // await db.insert(PollTable).values(poll);
  // console.log("New poll created");

  const option = [
    {
      text: "Mumbai",
      pollId: 1,
    },
    {
      text: "New Delhi",
      pollId: 2,
    },
    {
      text: "Chandigarh",
      pollId: 3,
    },
  ];

  // const users = await db.select().from(usersTable);
  // console.log("Getting all users from the database: ", users);

  // await db
  //   .update(usersTable)
  //   .set({
  //     age: 31,
  //   })
  //   .where(eq(usersTable.email, user.email));
  // console.log("User info updated!");

  // await db.delete(usersTable).where(eq(usersTable.email, user.email));
  // console.log("User deleted!");
}

async function seed() {
  console.log("Seeding database...");

  // 1. Insert Users
  const [alice, bob, charlie] = await db
    .insert(UsersTable)
    .values([
      { name: "Alice", email: "alice@example.com", password: "password123" },
      { name: "Bob", email: "bob@example.com", password: "password123" },
      {
        name: "Charlie",
        email: "charlie@example.com",
        password: "password123",
      },
    ])
    .returning();

  // 2. Insert a Poll (Created by Alice)
  const [poll] = await db
    .insert(PollTable)
    .values([
      {
        question: "What is your favorite programming language?",
        userId: alice.id,
      },
    ])
    .returning();

  // 3. Insert Options for that Poll
  const options = await db
    .insert(OptionTable)
    .values([
      { text: "TypeScript", pollId: poll.id },
      { text: "Python", pollId: poll.id },
      { text: "Rust", pollId: poll.id },
    ])
    .returning();

  // 4. Insert Votes
  // Bob votes for TypeScript (Option 0)
  // Charlie votes for Rust (Option 2)
  await db.insert(VoteTable).values([
    {
      userId: bob.id,
      pollId: poll.id,
      optionId: options[0].id,
    },
    {
      userId: charlie.id,
      pollId: poll.id,
      optionId: options[2].id,
    },
  ]);

  console.log("Seeding complete!");
}

// main();
seed();
