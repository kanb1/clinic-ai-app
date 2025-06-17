import mongoose from "mongoose";

// helper (brugt i sekretær integraitontests), i de test hvor man vil tjekke om et id i et svar matcher den i db
// undgår problemer med typeforskelle, simpel måde at sammenligne objekter uanset string/objectid
export function idsAreEqual(
  // tager to ID'er
  id1: string | mongoose.Types.ObjectId,
  id2: string | mongoose.Types.ObjectId
): boolean {
  // laver .toString() på begge uanset type
  // brug i test: expect(idsAreEqual(res.body[0]._id, createdObject._id)).toBe(true);
  return id1.toString() === id2.toString();
}
