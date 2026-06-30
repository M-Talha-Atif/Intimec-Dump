import { NextResponse } from "next/server";
import testMatrix from "./testMatrix";

// const API_URL = process.env.MOCK_DATA_API_URL;

export async function GET() {
  const matrix = testMatrix;
  // matrix.links.splice(0, 2000); // Clear existing links
  // for (let i = 0; i < 10; i++) {
  //   for (let j = 0; j < 100; j++) {
  //     matrix.links.push(`${i + 100},${j + 100}`);
  //   }
  // }
  // for (let i = 0; i < 1000; ++i) {
  //   matrix.links.push(`0,${i}`);
  //   matrix.links.push(`${i},0`);
  //   matrix.links.push(`${i},999`);
  //   matrix.links.push(`999,${i}`);
  // }
  // matrix.links.push("0,0");
  return NextResponse.json(matrix, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
