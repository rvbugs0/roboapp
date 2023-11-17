const { createClient } = require("@supabase/supabase-js");
const { SUPABASE_KEY, SUPABASE_URL } = require("./constants");

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
    return {success:true,data:data};
  } catch (error) {
    return {success:false,message:error.message};
    
}
  
}

module.exports = {
  fetchAvailableRobots,
};
