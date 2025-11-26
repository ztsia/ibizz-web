# MongoDB Lookup Service Guide

This guide outlines the schema design and API specifications for the new MongoDB backend.

**Note:** The attached `lookup_data.json` file contains the fully migrated data, formatted according to the schema below. It is ready to be imported directly into MongoDB.

## 1. MongoDB Schema Design

We will use a **Single Collection Strategy** where each lookup table (metadata + rows) is stored as a single document.

**Collection Name:** `lookup_tables`

### Document Structure

Each document represents one lookup group/table. Metadata fields are at the root level.

```json
{
  "_id": "ObjectId(...)",
  "slug": "currency-code",
  "title": "Currency Code",
  "category_id": "financial-banking",
  "short_description": "ISO 4217 three-letter currency codes.",
  "columns_schema": [
    { "key": "code", "type": "string", "label": "Code" },
    { "key": "currency_name", "type": "string", "label": "Currency Name" }
  ],
  "validation": {
    "code_regex": "^[A-Z]{3}$",
    "code_format": "Alphabetic"
  },
  "created_at": "ISO8601",
  "updated_at": "ISO8601",
  "rows": [
    {
      "id": "row_uuid_1",
      "code": "USD",
      "currency_name": "US Dollar"
    },
    {
      "id": "row_uuid_2",
      "code": "MYR",
      "currency_name": "Malaysian Ringgit"
    }
  ]
}
```

---

## 2. API Specification & Backend Implementation

The following sections map the frontend service calls to the required Backend APIs and MongoDB queries.

### A. Lookup Groups Service (`lookupGroups.service.ts`)

#### 1. List Lookup Groups

- **Endpoint:** `GET /api/lookup/groups`
- **Query Params:** `category_id` (optional)
- **Description:** Returns a list of all lookup groups (metadata only), optionally filtered by category.
- **MongoDB Query:**
  ```javascript
  const query = category_id ? { category_id: category_id } : {};
  db.lookup_tables
    .find(query, {
      projection: {
        rows: 0, // Exclude rows
      },
    })
    .sort({ title: 1 });
  ```

#### 2. Get Group Details

- **Endpoint:** `GET /api/lookup/groups/:slug`
- **Description:** Get metadata for a specific group.
- **MongoDB Query:**
  ```javascript
  db.lookup_tables.findOne(
    { slug: slug },
    { projection: { rows: 0 } }, // Exclude rows
  );
  ```

#### 3. Create Group

- **Endpoint:** `POST /api/lookup/groups`
- **Body:** `{ slug, title, category_id, columns_schema, validation, ... }`
- **Description:** Creates a new lookup group document.
- **MongoDB Query:**
  ```javascript
  db.lookup_tables.insertOne({
    ...body, // Spread body fields to root
    created_at: new Date(),
    rows: [],
  });
  ```

#### 4. Update Group

- **Endpoint:** `PUT /api/lookup/groups/:slug`
- **Body:** `{ title, short_description, validation, ... }`
- **Description:** Updates group metadata.
- **MongoDB Query:**
  ```javascript
  db.lookup_tables.updateOne(
    { slug: slug },
    {
      $set: {
        title: body.title,
        short_description: body.short_description,
        validation: body.validation,
        updated_at: new Date(),
        // ... map other fields
      },
    },
  );
  ```

#### 5. Delete Group

- **Endpoint:** `DELETE /api/lookup/groups/:slug`
- **Description:** Deletes the entire group and its data.
- **MongoDB Query:**
  ```javascript
  db.lookup_tables.deleteOne({ slug: slug });
  ```

---

### B. Lookup Table Manager Service (`lookupTableManager.service.ts`)

#### 1. List Items (with Pagination & Search)

- **Endpoint:** `GET /api/lookup/data/:slug`
- **Query Params:** `page` (default 1), `perPage` (default 10), `q` (search text), `count` (true/false)
- **Description:** Returns rows for a specific group.
- **MongoDB Query (Aggregation):**

  ```javascript
  const pipeline = [
    { $match: { slug: slug } },
    {
      $project: {
        rows: {
          $filter: {
            input: '$rows',
            as: 'row',
            cond: {
              // Implement search logic here if 'q' is present
              $regexMatch: {
                input: '$$row.description',
                regex: q,
                options: 'i',
              },
            },
          },
        },
      },
    },
    // Pagination
    {
      $project: {
        total: { $size: '$rows' },
        items: { $slice: ['$rows', (page - 1) * perPage, perPage] },
      },
    },
  ];

  db.lookup_tables.aggregate(pipeline);
  ```

#### 2. Get Single Item

- **Endpoint:** `GET /api/lookup/data/:slug/row/:rowId`
- **Description:** Get a specific row.
- **MongoDB Query:**
  ```javascript
  db.lookup_tables.findOne(
    { slug: slug, 'rows.id': rowId },
    { projection: { 'rows.$': 1 } },
  );
  ```

#### 3. Create Item

- **Endpoint:** `POST /api/lookup/data/:slug`
- **Body:** `{ code, description, ... }`
- **Description:** Add a new row to the group.
- **MongoDB Query:**
  ```javascript
  const newRow = { id: uuid(), ...body };
  db.lookup_tables.updateOne({ slug: slug }, { $push: { rows: newRow } });
  ```

#### 4. Update Item

- **Endpoint:** `PUT /api/lookup/data/:slug/row/:rowId`
- **Body:** `{ code, description, ... }`
- **Description:** Update an existing row.
- **MongoDB Query:**
  ```javascript
  db.lookup_tables.updateOne(
    { slug: slug, 'rows.id': rowId },
    {
      $set: {
        'rows.$.code': body.code,
        'rows.$.description': body.description,
      },
    },
  );
  ```

#### 5. Delete Item

- **Endpoint:** `DELETE /api/lookup/data/:slug/row/:rowId`
- **Description:** Remove a row.
- **MongoDB Query:**
  ```javascript
  db.lookup_tables.updateOne(
    { slug: slug },
    { $pull: { rows: { id: rowId } } },
  );
  ```

---

## 3. Data Import

The provided `lookup_data.json` file is already formatted as a JSON array of documents matching the schema above.

**To initialize the database:**

1.  Ensure you have the `lookup_data.json` file.
2.  Use `mongoimport` to load the data into the `lookup_tables` collection:

    ```bash
    mongoimport --db <your_db_name> --collection lookup_tables --file lookup_data.json --jsonArray
    ```

## 4. Example Collection Structure

```json
/* Collection: lookup_tables */
[
  {
    "_id": ObjectId("..."),
    "slug": "currency-code",
    "title": "Currency Code",
    "category_id": "financial-banking",
    "validation": {
      "code_regex": "^[A-Z]{3}$",
      "code_format": "Alphabetic"
    },
    "columns_schema": [...],
    "rows": [
      { "id": 1, "code": "USD", "currency_name": "US Dollar" },
      { "id": 2, "code": "EUR", "currency_name": "Euro" }
    ]
  },
  {
    "_id": ObjectId("..."),
    "slug": "country-code",
    "title": "Country Code",
    "validation": { ... },
    "rows": [ ... ]
  }
]
```
