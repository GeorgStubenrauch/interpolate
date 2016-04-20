<?php
	
	//$bbox = isset($_GET['bbox'])?explode(',',$_GET['bbox']):false;
	$user = $_GET["USER"];
	
	//Edit the passed username (Part1_Part2_Part3) and remove the last part:
	$delimiter = "_";
	$split_user = explode ( $delimiter , $user );
	$count_entries = count($split_user);
	$query_user = "";
	if ($count_entries > 1) {
		for ($i = 0; $i <= $count_entries-2; $i++) {
			$query_user = $query_user . $split_user[$i] . "_";
		}
		
	} else {
		$query_user = $split_user[0];
	}
	//Add "%" for the LIKE clause of the query:
	$query_user = $query_user . "%";
	
	//open the database:
    $db = new SQLite3('interpolation_app.db'); 
	
	//define SQL statement for query:
	//$sql = "SELECT lat, lon, temp FROM 'measurements' WHERE lon BETWEEN ".$bbox[0]." AND ".$bbox[2]." AND lat BETWEEN ".$bbox[1]." AND ".$bbox[3];
	//$sql = "SELECT ID, LAT, LON, TEMP FROM 'measurements' WHERE USER = '".$user."'";
	$sql = "SELECT ID, LAT, LON, TEMP, USER FROM 'measurements' WHERE USER LIKE '".$query_user."'";
	
	//save query results:
	$result = $db->query($sql);
	
	//create array to save measurements as FeatureCollection:
	$featurecollection = array("type"=>"FeatureCollection");
	$features = array();
	
	//save measurements with while-loop -> row by row:
	while ($row = $result->fetchArray()) {
		$geometry = array("type"=>"Point", "coordinates"=>[$row['LAT'],$row['LON']]);
		$properties = array("temp"=>$row['TEMP'], "id"=>$row['ID'], "user"=>$row['USER']);
		$features[] = array("type"=>"Feature","geometry"=>$geometry,"properties"=>$properties);
	}
	$featurecollection["features"]=$features;
	
	//return result using JavaScript Object Notation:
	echo json_encode($featurecollection);
	
	// close the database connection
	$db->close();
?>