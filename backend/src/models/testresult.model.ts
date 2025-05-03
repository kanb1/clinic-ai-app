import mongoose, { Schema, Document } from 'mongoose';

export interface ITestResult extends Document {
  patient_id: mongoose.Types.ObjectId;
  test_name: string;
  result: string;
  date: Date;
}

const TestResultSchema: Schema = new Schema(
  {
    patient_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    test_name: { type: String, required: true },
    result: { type: String, required: true },
    date: { type: Date, required: true },
  },
  { timestamps: true }
);

export const TestResultModel = mongoose.model<ITestResult>(
  'TestResult',
  TestResultSchema
);
