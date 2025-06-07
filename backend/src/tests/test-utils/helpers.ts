import mongoose from "mongoose";

// helper (brugt i sekretær integraitontests), i de test hvor man vil tjekke om et id i et svar matcher den i db
// fx: expect(idsAreEqual(res.body[0]._id, createdObject._id)).toBe(true);
// undgår problemer med typeforskelle, simpel måde at sammenligne objekter uanset string/objectid
export function idsAreEqual(
  id1: string | mongoose.Types.ObjectId,
  id2: string | mongoose.Types.ObjectId
): boolean {
  return id1.toString() === id2.toString();
}
