// generate-mock-csv.js
const fs = require('fs');
const path = require('path');

// 1. Define the messy, disparate column headers
// We mix standard fields with heavily duplicated, poorly named custom fields 
// to truly test the LLM's semantic reasoning capabilities.
const headers =[
  // Standard System Fields (AI should ignore these)
  "First Name", "Last Name", "Email Address", "Phone Number", "City", "State",

  // Group 1: Relocation (Highly disparate)
  "Relo", "Willing to Relocate", "relocation?", "Will Move", "Open to Relo", "Mobility",

  // Group 2: Compensation / Salary
  "current salary", "Base pay", "Comp (Base)", "Curr. Base", "Expected OTE", "OTE Expectation", "Target Comp", "Desired Salary",

  // Group 3: Remote Work / WFH Preferences
  "Remote OK?", "WFH", "Hybrid/Remote", "In-Office Preference", "Willing to commute",

  // Group 4: Management Experience
  "Managed Team?", "Direct Reports", "People Manager", "Team Size", "Leadership Exp",

  // Group 5: Notice Period / Availability
  "Notice", "Available to Start", "Days to Start", "Notice Period (Weeks)",

  // Group 6: Security Clearance
  "Clearance Level", "Has Clearance", "Govt Clearance", "Security Cleared"
];

// 2. Generate a few rows of dummy data
// (The app only reads the headers for the AI prompt, but adding data makes the file look authentic)
const mockDataRows =[[
    "John", "Doe", "john.doe@example.com", "555-0101", "Austin", "TX",
    "Yes", "Y", "True", "Yes", "Yes", "High", // Relocation
    "120000", "120k", "120000", "120k", "150000", "150k", "150000", "150k", // Comp
    "Yes", "True", "Hybrid", "No", "Yes", // Remote
    "Yes", "5", "True", "5-10", "Yes", // Management
    "2 weeks", "14 days", "14", "2", // Notice
    "Top Secret", "Yes", "TS/SCI", "True" // Clearance
  ],[
    "Jane", "Smith", "jane.smith@example.com", "555-0202", "Seattle", "WA",
    "No", "N", "False", "No", "No", "Low", 
    "140000", "140k", "140000", "140k", "180000", "180k", "180000", "180k", 
    "Yes", "True", "Remote Only", "No", "No", 
    "No", "0", "False", "0", "No", 
    "Immediate", "0 days", "0", "0", 
    "None", "No", "None", "False" 
  ]
];

// 3. Construct the CSV string
const csvContent =[
  headers.join(','), // Header row
  ...mockDataRows.map(row => row.map(cell => `"${cell}"`).join(',')) // Data rows escaped with quotes
].join('\n');

// 4. Write to file
const outputPath = path.join(__dirname, 'legacy_export.csv');

fs.writeFile(outputPath, csvContent, (err) => {
  if (err) {
    console.error("❌ Error writing CSV file:", err);
  } else {
    console.log(`✅ Successfully generated mock CSV at:\n📁 ${outputPath}`);
    console.log(`📊 Total columns generated: ${headers.length}`);
    console.log("🚀 You can now drag and drop this file into your Stardex Onboarding UI!");
  }
});