<?php
	ini_set("display_warnings", true);
  
	$part1 = $_GET["PART1"];
	$part2 = $_GET["PART2"];
	$tid = $_GET["TID"];
	
    //open the database:
    $db = new SQLite3('interpolation_app.db'); 
	
	/*Check if there are user registered*/
	for ($i=0; $i<$count_array;$i++){
		$tablename = $array_tables[(int)$i];
		//echo $tablename;
		$sql = "SELECT COUNT(*) as count FROM '".$tablename."' WHERE USER = '".$user."'";
		
		//save query results:
		$result = $db->query($sql);
		
		$row = $result->fetchArray();
		
		$numRows = $row['count'];
		
		$count_rows += $numRows;
		
		//user is registered:
		if ($numRows != 0) {
			//as teacher:
			if ($tablename == 'teachers') {
				$sql = "SELECT ID FROM '".$tablename."' WHERE USER = '".$user."'";
				$result = $db->query($sql);
				//save measurements with while-loop -> row by row:
				while ($row = $result->fetchArray()) {
					$id = $row['ID'];
				}
				echo $id;
				break;
			//as user:
			} else {
				echo 0;
				break;
			}
		}		
	}
	//If user is not registered -> $count_rows == 0, then return "false";
	if ($count_rows == 0) {
		echo "false";
	}
	
    // close the database connection
    $db->close();
  
?>
