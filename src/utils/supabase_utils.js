const { createClient } = require("@supabase/supabase-js");
const { SUPABASE_KEY, SUPABASE_URL } = require("./constants");
const fs = require("fs");
// const user_email = 'user@example.com';
// const robot_id = '123';

async function uploadZipFileAndCreateEntry(uploadFilePath,runId) {
  const bucketName = "run_output";
  const filePath = runId;
  const fileName = "output_new.zip"; // Adjust the file name
  const contentType = "application/zip"; // Content type for zip files

  // Read the zip file content (replace 'path/to/your/zip/file' with the actual path)
  const zipFilePath = uploadFilePath;
  const fileContent = fs.readFileSync(zipFilePath);
  const timestamp = new Date().toISOString();
  const bucketPath = `${filePath}/${fileName}`;

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    // Upload the zip file
    const { data: fileData, error: fileError } = await supabase.storage
      .from(bucketName)
      .upload(bucketPath, fileContent, {
        contentType: contentType,
      });

    if (fileError) {
      throw new Error(`Error uploading zip file: ${fileError.message}`);
    }
    console.log(fileData)
    console.log("Zip file uploaded successfully:", fileData.path);

    // // Create an entry in the "uploads" table
    // const { data: insertData, error: insertError } = await supabase
    //   .from("uploads")
    //   .insert([
    //     {
    //       user_email: user_email,
    //       robot_id: robot_id,
    //       timestamp: timestamp,
    //       bucket_path: bucketPath,
    //     },
    //   ]);

    // if (insertError) {
    //   throw new Error(
    //     `Error inserting data into uploads table: ${insertError.message}`
    //   );
    // }

    // console.log("Entry created in uploads table:", insertData);
  } catch (err) {
    console.error(err.message);
  }
}

// uploadZipFileAndCreateEntry();

async function fetchAvailableRobots() {
  // Replace 'your_table_name' with the actual name of your table
  const tableName = "robot";

  // Initialize the Supabase client
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  try {
    const { data, error } = await supabase.from(tableName).select("*");

    if (error) {
      throw error;
    }

    console.log("Retrieved records:", data);
    return { success: true, data: data };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

module.exports = {
  fetchAvailableRobots,
  uploadZipFileAndCreateEntry,
};
