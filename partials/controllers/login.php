<?php
	ini_set("display_warnings", true);
  
	$user = $_GET["USER"];
	
    //open the database:
    $db = new SQLite3('interpolation_app.db'); 
	
	//In order to not display the marker twice, we have to get the ID and return it to the client, after that the ID is added to the array of all displayed markers:
	//Check if measurement already exists, hence, temp only needs to be updated:
	$sql = "SELECT COUNT(*) as count FROM 'users' WHERE USER = '".$user."'";
	
	//save query results:
	$result = $db->query($sql);
	
	$row = $result->fetchArray();
	
	$numRows = $row['count'];
	
	if ($numRows != 0) {
		echo "true";
	} else {
		echo "false";
	}
	
    // close the database connection
    $db->close();
  
?>
