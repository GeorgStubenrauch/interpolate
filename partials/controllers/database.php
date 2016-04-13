<?php
  ini_set("display_warnings", true);
  try
  {
	$user = $_GET["USER"];
	$lat = $_GET["LAT"];
	$long = $_GET["LONG"];
	$temp = $_GET["TEMP"];
	echo "values" .$user.",".$lat.",".$long.",".$temp;
    //open the database
    $db = new SQLite3('measurements.db');

    //create the database
    //$db->exec("CREATE TABLE Dogs (Id INTEGER PRIMARY KEY, Breed TEXT, Name TEXT, Age INTEGER)");    

    //insert some data...
    $db->exec("INSERT INTO measurements (USER, LAT, LONG, TEMP) VALUES ('".$user."',".$lat.",".$long.",".$temp.");"); //user -> double quotes for text values
               
    // close the database connection
    $db = NULL;
  }
  catch(PDOException $e)
  {
    print 'Exception : '.$e->getMessage();
  }
?>
