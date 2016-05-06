<?php


// function to connect to a database:
//function connectToDb($dbname) {
function connectToDb() {
	
	try {
		//$dbh = new PDO('sqlite:D:/xampp/htdocs/sqlite/test.db')
		$dbh = new PDO('sqlite:inttool.db');
		//$dbh = new PDO($dbname);
	} catch(PDOException $e) {
		echo $e->getMessage();
	}

	if (!$dbh) {

		die("Error in connection: " . pg_last_error());
		$output = "<script>console.log( 'Failure to connect to db!' );</script>";
		echo $output;

	} else {
		//echo "Connection successful" . "<p />";
		$output = "<script>console.log( 'Connection to db successfull!' );</script>";
		echo $output;
		return $dbh;
	}

}

if (isset($_POST['callConnectToDb'])) {
        echo func1($_POST['callConnectToDb']);
}

function createTable($dbh, $tablename) {
	try {
		//create the database
		$dbh->exec("CREATE TABLE " + $tablename + " (Id INTEGER PRIMARY KEY AUTOINCREMENT, User VARCHAR(55), X DOUBLE, Y DOUBLE, Temp FLOAT)");
		$output = "<script>console.log( 'Creation of table successfull!' );</script>";
		echo $output;
	} catch(PDOException $e) {
		echo $e->getMessage();
	}
}

function insertData($dbh, $tablename, $value_user, $value_x, $value_y, $value_temp) {
	try {
		// Prepare INSERT statement to SQLite3 file db
		$insert = "INSERT INTO measurements (User, X, Y, Temp) 
                VALUES (:user, :x, :y, :temp)";
		$stmt = $dbh->prepare($insert);
 
		// Bind parameters to statement variables
		$stmt->bindParam(':user', $value_user);
		$stmt->bindParam(':x', $value_x);
		$stmt->bindParam(':y', $value_y);
		$stmt->bindParam(':temp', $value_temp);
		$stmt->execute();
		// Loop thru all messages and execute prepared insert statement
		/*foreach ($messages as $m) {
			// Set values to bound variables
			$title = $m['title'];
			$message = $m['message'];
			$time = $m['time'];
 
			// Execute statement
			$stmt->execute();
		}*/
		$output = "<script>console.log( 'Insertion into table successfull!' );</script>";
		echo $output;
	} catch(PDOException $e) {
		echo $e->getMessage();
	}
}

if (isset($_POST['callInsertData'])) {
        echo func1($_POST['callInsertData']);
}

function printTable($dbh, $tablename) {
	//now output the data to a simple html table...
	print "<table border=1>";
	print "<tr><td>Id</td><td>User</td><td>X</td><td>Y</td><td>Temp</td></tr>";
	$result = $dbh->query('SELECT * FROM measurements');
	foreach($result as $row)
	{
		print "<tr><td>".$row['Id']."</td>";
		print "<td>".$row['User']."</td>";
		print "<td>".$row['X']."</td>";
		print "<td>".$row['Y']."</td>";
		print "<td>".$row['Temp']."</td></tr>";
	}
	print "</table>";
}

function disconnectFromDb($dbh) {
	
	// close the database connection
	$dbh = NULL;
	
	$output = "<script>console.log( 'Disconnection from db successfull!' );</script>";
	echo $output;
}

if (isset($_POST['callDisconnectFromDb'])) {
        echo func1($_POST['callDisconnectFromDb']);
}

$dbname = 'sqlite:inttool.db';
//$dbh = connectToDb($dbname);
$dbh = connectToDb();
/*$tablename = "measurements";
createTable($dbh, $tablename);
$field_user = 'User';
$field_x = 'X';
$field_y = 'Y';
$field_temp = 'Temp';
$value_user = 'User1';
insertData($dbh, $tablename, $field_user, $field_x, $field_y, $field_temp, $value_user, 42.5, 16.5, 24.5);
insertData($dbh, $tablename, $field_user, $field_x, $field_y, $field_temp, $value_user, 42.5, 16.5, 24.5);
insertData($dbh, $tablename, $field_user, $field_x, $field_y, $field_temp, $value_user, 42.5, 16.5, 24.5);
insertData($dbh, $tablename, $field_user, $field_x, $field_y, $field_temp, $value_user, 42.5, 16.5, 24.5);
printTable($dbh, $tablename);*/
$tablename = '"main"."measurements"';
$value_user = "Georg";
$value_x = 49.0;
$value_y = 8.0;
$value_temp = 24.5;
insertData($dbh, $tablename, $value_user, $value_x, $value_y, $value_temp);
insertData($dbh, $tablename, $value_user, $value_x, $value_y, $value_temp);
insertData($dbh, $tablename, $value_user, $value_x, $value_y, $value_temp);
insertData($dbh, $tablename, $value_user, $value_x, $value_y, $value_temp);
printTable($dbh, $tablename);
disconnectFromDb($dbh);


?>
