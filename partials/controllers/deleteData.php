<?php
	ini_set("display_warnings", true);

	$id = $_GET["ID"];
	//echo "values" .$user.",".$lat.",".$lon.",".$temp;
	
    //open the database:
    $db = new SQLite3('interpolation_app.db'); 
		
	//delete entry with given id from table "measurements":
	$db->exec("DELETE FROM 'measurements' WHERE ID = ".$id.";");

    // close the database connection
    $db->close();
  
?>
