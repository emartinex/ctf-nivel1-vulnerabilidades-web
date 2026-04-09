const path = require("path");
const Database = require("better-sqlite3");

const dbPath = path.join(__dirname, "ctf_lab.db");
const db = new Database(dbPath);

function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      password TEXT NOT NULL
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS flags (
      id INTEGER PRIMARY KEY,
      challenge TEXT NOT NULL,
      flag TEXT NOT NULL
    );
  `);

  const userCount = db.prepare("SELECT COUNT(*) AS count FROM users").get().count;
  if (userCount === 0) {
    db.prepare("INSERT INTO users (username, password) VALUES (?, ?)").run("admin", "S3cur3P4ss!");
  }

  const flagsCount = db.prepare("SELECT COUNT(*) AS count FROM flags").get().count;
  if (flagsCount === 0) {
    const insertFlag = db.prepare("INSERT INTO flags (id, challenge, flag) VALUES (?, ?, ?)");
    const flags = [
      [1, "sql_injection", "CTF{sql_1nj3ct10n_byp4ss_succ3ss}"],
      [2, "xss", "CTF{xss_c00k13_st0l3n_gg}"],
      [3, "network", "CTF{w1r3sh4rk_http_pl41nt3xt}"]
    ];

    const insertMany = db.transaction((rows) => {
      for (const row of rows) {
        insertFlag.run(row[0], row[1], row[2]);
      }
    });

    insertMany(flags);
  }
}

module.exports = {
  db,
  initializeDatabase
};
