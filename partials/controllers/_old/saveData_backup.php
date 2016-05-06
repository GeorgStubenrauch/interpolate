<?php
	ini_set("display_warnings", true);
  
	$user = $_GET["USER"];
	$lat = $_GET["LAT"];
	$lon = $_GET["LON"];
	$temp = $_GET["TEMP"];
	//echo "values" .$user.",".$lat.",".$lon.",".$temp;
	
    //open the database:
    $db = new SQLite3('interpolation_app.db');   
	
	//Check if measurement already exists, hence, temp only needs to be updated:
	$sql = "SELECT ID FROM 'measurements' WHERE USER = '".$user."' AND LAT = ".$lat." AND LON = ".$lon;
	
	//save query results:
	$result = $db->query($sql);
	
	//Count number of returned rows:
	$rows = 0;
	
	while ($row = $result->fetchArray()) {
		$rows = $rows + 1;
	}
	//echo $rows;
	//echo "";
	
	//If an ID is returned -> updated existing entry:
	if ($rows > 0) {
		//echo "Updating entries";
		//Update existing entry:
		$db->exec("UPDATE measurements SET TEMP = ".$temp." WHERE USER = '".$user."' AND LAT = ".$lat." AND LON = ".$lon.";");
    }
	//If result is null -> insert new entry:
	else {
		//echo "Inserting entry";
		//insert measurement:
		$db->exec("INSERT INTO measurements (USER, LAT, LON, TEMP) VALUES ('".$user."',".$lat.",".$lon.",".$temp.");"); //user -> double quotes for text values
		
		//In order to not display the marker twice, we have to get the ID and return it to the client, after that the ID is added to the array of all displayed markers:
		//Check if measurement already exists, hence, temp only needs to be updated:
		$sql = "SELECT ID FROM 'measurements' WHERE USER = '".$user."' AND LAT = ".$lat." AND LON = ".$lon." AND TEMP = ".$temp;
	
		//save query results:
		$result = $db->query($sql);
		
		//save measurements with while-loop -> row by row:
		while ($row = $result->fetchArray()) {
			$id = $row['ID'];
		}
		//return id:
		echo $id;
		
	}
    // close the database connection
    $db->close();
  
?>
