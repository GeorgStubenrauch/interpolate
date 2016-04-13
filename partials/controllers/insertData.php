<?php
  ini_set("display_warnings", true);
  try
  {
	$user = $_GET["USER"];
	$lat = $_GET["LAT"];
	$lon = $_GET["LON"];
	$temp = $_GET["TEMP"];
	echo "values" .$user.",".$lat.",".$lon.",".$temp;
    //open the database
    $db = new SQLite3('interpolation_app.db');

    //create the database
    //$db->exec("CREATE TABLE Dogs (Id INTEGER PRIMARY KEY, Breed TEXT, Name TEXT, Age INTEGER)");    

    //insert some data...
    $db->exec("INSERT INTO measurements (USER, LAT, LON, TEMP) VALUES ('".$user."',".$lat.",".$lon.",".$temp.");"); //user -> double quotes for text values
               
    // close the database connection
    $db = NULL;
  }
  catch(PDOException $e)
  {
    print 'Exception : '.$e->getMessage();
  }
?>
