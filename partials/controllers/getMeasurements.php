<?php
	
	//$bbox = isset($_GET['bbox'])?explode(',',$_GET['bbox']):false;
	$user = $_GET["USER"];

	//open the database:
    $db = new SQLite3('interpolation_app.db'); 
	
	//define SQL statement for query:
	//$sql = "SELECT lat, lon, temp FROM 'measurements' WHERE lon BETWEEN ".$bbox[0]." AND ".$bbox[2]." AND lat BETWEEN ".$bbox[1]." AND ".$bbox[3];
	$sql = "SELECT ID, LAT, LON, TEMP FROM 'measurements' WHERE USER = '".$user."'";
	
	//save query results:
	$result = $db->query($sql);
	
	//create array to save measurements as FeatureCollection:
	$featurecollection = array("type"=>"FeatureCollection");
	$features = array();
	
	//save measurements with while-loop -> row by row:
	while ($row = $result->fetchArray()) {
		$geometry = array("type"=>"Point", "coordinates"=>[$row['LAT'],$row['LON']]);
		$properties = array("temp"=>$row['TEMP'], "id"=>$row['ID']);
		$features[] = array("type"=>"Feature","geometry"=>$geometry,"properties"=>$properties);
	}
	$featurecollection["features"]=$features;
	
	//return result using JavaScript Object Notation:
	echo json_encode($featurecollection);
	
	// close the database connection
	$db->close();
?>