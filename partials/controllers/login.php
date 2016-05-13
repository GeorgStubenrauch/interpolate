<?php
	ini_set("display_warnings", true);
  
	$user = $_GET["USER"];
	$array_tables = [(int)0 => 'teachers', (int)1 => 'users'];
	$count_array = sizeof($array_tables);
	$count_rows = 0;
	$tablename;
	
    //open the database:
    $db = new SQLite3('interpolation_app.db'); 
	
	/*There are two types of checks that need to be done:
	Is the username already registered and what type of user is it:
	a) teachers whose usernames are stored in the table "teachers"
	b) pupils whose usernames are stored in the table "users"
	If the user is a teacher, the id is returned, which is needed to determine the markers he is allowed to see/edit:*/
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
