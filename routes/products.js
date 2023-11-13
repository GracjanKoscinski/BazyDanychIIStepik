const express = require("express");
const recordRoutes = express.Router();
const dbo = require("../db/conn");
const { ObjectId } = require("mongodb");

// Dodawanie nowego produktu
recordRoutes.route("/products").post(async function (req, res) {
  const db = dbo.getDb();
  const { nazwa, cena, opis, ilosc, jednostka_miary } = req.body;

  try {
    // czy nazwa unikalna
    const existingProduct = await db
      .db("Zadanie_stepik")
      .collection("Products")
      .findOne({ nazwa });
    if (existingProduct) {
      return res.json({ error: "Produkt o tej nazwie już istnieje" });
    }
    const result = await db
      .db("Zadanie_stepik")
      .collection("Products")
      .insertOne({
        nazwa,
        cena,
        opis,
        ilosc,
        jednostka_miary,
      });

    return res.json({
      message: "Produkt dodany pomyślnie",
      id: result.insertedId,
    });
  } catch (error) {
    console.error("Błąd podczas dodawania produktu:", error);
    return res.json({ error: "Błąd podczas dodawania produktu:" });
  }
});

// get z filtrowaniem i sortowaniem po cenie
recordRoutes.route("/products").get(async function (req, res) {
  const db = dbo.getDb();
  let query = {};

  // Filtrowanie po cenie
  if (req.query.minCena && req.query.maxCena) {
    query.cena = {
      $gte: parseFloat(req.query.minCena),
      $lte: parseFloat(req.query.maxCena),
    };
  } else if (req.query.minCena) {
    query.cena = { $gte: parseFloat(req.query.minCena) };
  } else if (req.query.maxCena) {
    query.cena = { $lte: parseFloat(req.query.maxCena) };
  }

  try {
    const products = await db
      .db("Zadanie_stepik")
      .collection("Products")
      .find(query)
      .toArray();

    // Sortowanie po cenie
    if (req.query.sort === "asc") {
      products.sort((a, b) => a.cena - b.cena);
    } else if (req.query.sort === "desc") {
      products.sort((a, b) => b.cena - a.cena);
    }

    return res.json(products);
  } catch (error) {
    console.error("Błąd podczas pobierania produktów:", error);
    return res.json({ error: "Błąd podczas pobierania produktów:" });
  }
});

// Edycja istniejacego produktu
recordRoutes.route("products/:id").put(async function (req, res) {
  const db = dbo.getDb();
  const { nazwa, cena, opis, ilosc, jednostka_miary } = req.body;

  try {
    const existingProduct = await db
      .db("Zadanie_stepik")
      .collection("Products")
      .findOne({ _id: new ObjectId(req.params.id) });
    await db
      .db("Zadanie_stepik")
      .collection("Products")
      .updateOne(
        { _id: new ObjectId(req.params.id) },
        {
          $set: {
            nazwa: nazwa || existingProduct.nazwa,
            cena: cena || existingProduct.cena,
            opis: opis || existingProduct.opis,
            ilosc: ilosc || existingProduct.ilosc,
            jednostka_miary: jednostka_miary || existingProduct.jednostka_miary,
          },
        }
      );

    return res.json({ message: "Produkt zaktualizowany pomyślnie" });
  } catch (error) {
    console.error("Błąd podczas edycji produktu:", error);
    return res.json({ error: "Błąd podczas edycji produktu:" });
  }
});

//usuwanie po ID
recordRoutes.route("products/:id").delete(async (req, res) => {
  const db = dbo.getDb();
  const productId = req.params.id;
  try {
    const result = await db
      .db("Zadanie_stepik")
      .collection("Products")
      .deleteOne({ _id: new ObjectId(productId) });

    if (result.deletedCount === 1) {
      return res.json({ message: "Usunieto produkt" });
    }
  } catch (error) {
    console.error("Błąd podczas usuwania", error);
    return res.json({ error: "Błąd podczas usuwania" });
  }
});

//raport
recordRoutes.route("/products/raport").get(async (req, res) => {
  const db = dbo.getDb();
  try {
    const raport = await db
      .db("Zadanie_stepik")
      .collection("Products")
      .aggregate([
        {
          $group: {
            _id: null,
            produkty: {
              $addToSet: {
                nazwa: "$nazwa",
                ilosc: "$ilosc",
                lacznaWartosc: { $multiply: ["$ilosc", "$cena"] },
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            produkty: 1,
          },
        },
      ])
      .toArray();

    if (raport.length === 0) {
      return res.json({
        message: "Brak produktów w magazynie. Raport niedostępny.",
      });
    }
    return res.json(raport[0]);
  } catch (error) {
    console.error("Błąd podczas generowania raportu:", error);
    return res.json({ error: "Błąd podczas generowania raportu:" });
  }
});
module.exports = recordRoutes;
