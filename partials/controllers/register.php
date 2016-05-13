<?php
	ini_set("display_warnings", true);
  
	$part1 = $_GET["PART1"];
	$part2 = $_GET["PART2"];
	$amount = $_GET["AMOUNT"];
	$tid = $_GET["TID"];
	
	//Count the number of registered usersnames:
	$count = 0;
	
	//$amount = (int)$_GET["amount"];
	/*if ($amount < 1) { //cought in registerController with amount <=0
		die("the number of amount is wrong");
	}*/
	
    //open the database:
    $db = new SQLite3('interpolation_app.db'); 
	
	for ($i=1; $i<=(int)$amount;$i++){
		//In order to avoid cuplicate usernames it is checked if the name already exists:
		$user = $part1."_".$part2."_".$i;
		$sql = "SELECT COUNT(*) as count FROM 'users' WHERE USER = '".$user."'";
		
		//save query results:
		$result = $db->query($sql);
		
		$row = $result->fetchArray();
		
		$numRows = $row['count'];
		
		if ($numRows == 0) {
			$db->exec("INSERT INTO users (USER,TEACHER_ID) VALUES ('".$user."',".$tid.");");
			$count += 1;
			echo "true,";
		} else {
			echo "false,";
		}
	}
	
	//Update the number of registered usernames of the teacher:
	/*Code following*/
	
    // close the database connection
    $db->close();
  
?>
