import { google } from "googleapis";
import { Review } from "./types";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

export async function getGoogleSheetsClient() {
  const jsonStr = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

  if (!jsonStr) {
    console.warn("Missing Google Sheets credentials. Falling back to mock data if not in production.");
    return null;
  }

  try {
    const credentials = JSON.parse(jsonStr);
    
    // Some keys might need newlines replaced
    if (credentials.private_key) {
      credentials.private_key = credentials.private_key.replace(/\\n/g, "\n");
    }

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: SCOPES,
    });

    return google.sheets({ version: "v4", auth });
  } catch (err) {
    console.error("Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON", err);
    return null;
  }
}

export async function appendReviewRow(review: Review) {
  const sheets = await getGoogleSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
  const sheetName = process.env.GOOGLE_SHEET_NAME || "Sheet1";

  if (!sheets || !spreadsheetId) {
    console.log("Mock append:", review);
    return true; // pretend it worked
  }

  const row = [
    review.timestamp,
    review.employeeEmail,
    review.month,
    review.outputQuality,
    review.attendance,
    review.teamwork,
    review.comment,
    review.managerEmail,
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${sheetName}!A:H`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [row],
    },
  });

  return true;
}

export async function getReviewsForEmployee(employeeEmail: string): Promise<Review[]> {
  const sheets = await getGoogleSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
  const sheetName = process.env.GOOGLE_SHEET_NAME || "Sheet1";

  if (!sheets || !spreadsheetId) {
    // Return mock data if no DB keys
    return [
      {
        id: "mock-1",
        timestamp: new Date().toISOString(),
        employeeEmail,
        month: "Feb 2026",
        outputQuality: 3,
        attendance: 5,
        teamwork: 4,
        comment: "Solid effort but needs to work on attention to detail.",
        managerEmail: "manager@crystal.com"
      },
      {
        id: "mock-2",
        timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        employeeEmail,
        month: "Jan 2026",
        outputQuality: 4,
        attendance: 4,
        teamwork: 4,
        comment: "Good job this month. Keep it up.",
        managerEmail: "manager@crystal.com"
      }
    ];
  }

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:H`,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) return [];

    // Assuming first row is NOT header if they just have Sheet1 out of box,
    // wait, usually they make a header. Let's just slice if the first element is "timestamp" or "Timestamp"
    // otherwise just parse all.
    let dataRows = rows;
    if (dataRows.length > 0 && dataRows[0][0]?.toLowerCase().includes("timestamp")) {
       dataRows = rows.slice(1);
    }
    
    const reviews: Review[] = dataRows
      .map((row, index) => ({
        id: `row-${index}`,
        timestamp: row[0] || "",
        employeeEmail: row[1] || "",
        month: row[2] || "",
        outputQuality: parseInt(row[3] || "0", 10),
        attendance: parseInt(row[4] || "0", 10),
        teamwork: parseInt(row[5] || "0", 10),
        comment: row[6] || "",
        managerEmail: row[7] || "",
      }))
      .filter((r) => r.employeeEmail === employeeEmail);

    return reviews.reverse(); // Newest first
  } catch (err) {
    console.error("Failed to read from Google Sheets", err);
    return [];
  }
}

export async function getAllReviews(): Promise<Review[]> {
  const sheets = await getGoogleSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
  const sheetName = process.env.GOOGLE_SHEET_NAME || "Sheet1";

  if (!sheets || !spreadsheetId) {
    // Return mock data if no DB keys
    return [
      {
        id: "mock-1",
        timestamp: new Date().toISOString(),
        employeeEmail: "amit.das@crystal.com",
        month: "Feb 2026",
        outputQuality: 3,
        attendance: 5,
        teamwork: 4,
        comment: "Solid effort but needs to work on attention to detail.",
        managerEmail: "manager@crystal.com"
      },
      {
        id: "mock-2",
        timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        employeeEmail: "priyam.manna@crystal.com",
        month: "Jan 2026",
        outputQuality: 4,
        attendance: 4,
        teamwork: 4,
        comment: "Good job this month. Keep it up.",
        managerEmail: "manager@crystal.com"
      }
    ];
  }

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:H`,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) return [];

    let dataRows = rows;
    if (dataRows.length > 0 && dataRows[0][0]?.toLowerCase().includes("timestamp")) {
       dataRows = rows.slice(1);
    }
    
    const reviews: Review[] = dataRows
      .map((row, index) => ({
        id: `row-${index}`,
        timestamp: row[0] || "",
        employeeEmail: row[1] || "",
        month: row[2] || "",
        outputQuality: parseInt(row[3] || "0", 10),
        attendance: parseInt(row[4] || "0", 10),
        teamwork: parseInt(row[5] || "0", 10),
        comment: row[6] || "",
        managerEmail: row[7] || "",
      }));

    return reviews.reverse(); // Newest first
  } catch (err) {
    console.error("Failed to read all from Google Sheets", err);
    return [];
  }
}
