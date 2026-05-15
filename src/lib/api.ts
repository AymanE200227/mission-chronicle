import { createServerFn } from "@tanstack/react-start";

export type Membre = { id: string; nom: string; prenom: string };
export type Destination = { id: string; name: string };
export type YearRow = { id: string; year: number };
export type Mission = {
  id: string;
  membre_id: string;
  destination_id: string | null;
  destination_name: string;
  mission: string;
  date: string;
};

async function db() {
  const mod = await import("./db.server");
  return mod.getDb();
}

// --- Membres ---

export const fetchMembres = createServerFn({ method: "GET" }).handler(async () => {
  const d = await db();
  return d.prepare("SELECT id, nom, prenom FROM membres ORDER BY nom").all() as Membre[];
});

export const createMembre = createServerFn({ method: "POST" })
  .inputValidator((data: { nom: string; prenom: string }) => data)
  .handler(async ({ data }) => {
    const d = await db();
    const id = crypto.randomUUID();
    d.prepare("INSERT INTO membres (id, nom, prenom) VALUES (?, ?, ?)").run(
      id,
      data.nom,
      data.prenom,
    );
  });

export const updateMembre = createServerFn({ method: "POST" })
  .inputValidator((data: Membre) => data)
  .handler(async ({ data }) => {
    const d = await db();
    d.prepare("UPDATE membres SET nom = ?, prenom = ? WHERE id = ?").run(
      data.nom,
      data.prenom,
      data.id,
    );
  });

export const deleteMembre = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const d = await db();
    d.prepare("DELETE FROM membres WHERE id = ?").run(data.id);
  });

// --- Destinations ---

export const fetchDestinations = createServerFn({ method: "GET" }).handler(async () => {
  const d = await db();
  return d.prepare("SELECT id, name FROM destinations ORDER BY name").all() as Destination[];
});

export const createDestination = createServerFn({ method: "POST" })
  .inputValidator((data: { name: string }) => data)
  .handler(async ({ data }) => {
    const d = await db();
    const id = crypto.randomUUID();
    d.prepare("INSERT INTO destinations (id, name) VALUES (?, ?)").run(id, data.name);
  });

export const updateDestination = createServerFn({ method: "POST" })
  .inputValidator((data: Destination) => data)
  .handler(async ({ data }) => {
    const d = await db();
    d.prepare("UPDATE destinations SET name = ? WHERE id = ?").run(data.name, data.id);
  });

export const deleteDestination = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const d = await db();
    d.prepare("DELETE FROM destinations WHERE id = ?").run(data.id);
  });

// --- Years ---

export const fetchYears = createServerFn({ method: "GET" }).handler(async () => {
  const d = await db();
  return d.prepare("SELECT id, year FROM years ORDER BY year DESC").all() as YearRow[];
});

export const createYear = createServerFn({ method: "POST" })
  .inputValidator((data: { year: number }) => data)
  .handler(async ({ data }) => {
    const d = await db();
    const id = crypto.randomUUID();
    d.prepare("INSERT INTO years (id, year) VALUES (?, ?)").run(id, data.year);
  });

export const deleteYear = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const d = await db();
    d.prepare("DELETE FROM years WHERE id = ?").run(data.id);
  });

// --- Missions ---

export const fetchMissions = createServerFn({ method: "GET" })
  .inputValidator((data: { membreId?: string }) => data)
  .handler(async ({ data }) => {
    const d = await db();
    if (data.membreId) {
      return d
        .prepare(
          "SELECT id, membre_id, destination_id, destination_name, mission, date FROM missions WHERE membre_id = ? ORDER BY date DESC",
        )
        .all(data.membreId) as Mission[];
    }
    return d
      .prepare(
        "SELECT id, membre_id, destination_id, destination_name, mission, date FROM missions ORDER BY date DESC",
      )
      .all() as Mission[];
  });

export const createMission = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      membre_id: string;
      destination_id: string | null;
      destination_name: string;
      mission: string;
      date: string;
    }) => data,
  )
  .handler(async ({ data }) => {
    const d = await db();
    const id = crypto.randomUUID();
    d.prepare(
      "INSERT INTO missions (id, membre_id, destination_id, destination_name, mission, date) VALUES (?, ?, ?, ?, ?, ?)",
    ).run(id, data.membre_id, data.destination_id, data.destination_name, data.mission, data.date);
  });

export const updateMission = createServerFn({ method: "POST" })
  .inputValidator((data: Mission) => data)
  .handler(async ({ data }) => {
    const d = await db();
    d.prepare(
      "UPDATE missions SET membre_id = ?, destination_id = ?, destination_name = ?, mission = ?, date = ? WHERE id = ?",
    ).run(
      data.membre_id,
      data.destination_id,
      data.destination_name,
      data.mission,
      data.date,
      data.id,
    );
  });

export const deleteMission = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const d = await db();
    d.prepare("DELETE FROM missions WHERE id = ?").run(data.id);
  });

// --- Missions by destination ---

export type MissionWithMembre = Mission & { membre_nom: string; membre_prenom: string };

export const fetchMissionsByDestination = createServerFn({ method: "GET" })
  .inputValidator((data: { destinationName: string }) => data)
  .handler(async ({ data }) => {
    const d = await db();
    return d
      .prepare(
        `SELECT m.id, m.membre_id, m.destination_id, m.destination_name, m.mission, m.date,
                mb.nom AS membre_nom, mb.prenom AS membre_prenom
         FROM missions m
         JOIN membres mb ON mb.id = m.membre_id
         WHERE m.destination_name = ?
         ORDER BY m.date DESC`,
      )
      .all(data.destinationName) as MissionWithMembre[];
  });

// --- Random available membre (no mission for given destination) ---

export const fetchAvailableMembres = createServerFn({ method: "GET" })
  .inputValidator((data: { destinationName: string; excludeIds?: string[] }) => data)
  .handler(async ({ data }) => {
    const d = await db();
    const excludePlaceholders =
      data.excludeIds && data.excludeIds.length > 0
        ? data.excludeIds.map(() => "?").join(",")
        : null;

    const query = excludePlaceholders
      ? `SELECT id, nom, prenom FROM membres
         WHERE id NOT IN (
           SELECT DISTINCT membre_id FROM missions WHERE destination_name = ?
         )
         AND id NOT IN (${excludePlaceholders})
         ORDER BY nom`
      : `SELECT id, nom, prenom FROM membres
         WHERE id NOT IN (
           SELECT DISTINCT membre_id FROM missions WHERE destination_name = ?
         )
         ORDER BY nom`;

    const params = excludePlaceholders
      ? [data.destinationName, ...data.excludeIds!]
      : [data.destinationName];

    return d.prepare(query).all(...params) as Membre[];
  });
