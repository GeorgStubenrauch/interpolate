<?php
	
	//$bbox = isset($_GET['bbox'])?explode(',',$_GET['bbox']):false;
	$user = $_GET["USER"];
	
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
	$query_user = $query_user . "%";
	echo $query_user;
?>