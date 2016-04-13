<?php
	$db = new SQLite3('measurements.db');
	$db->exec('CREATE TABLE bar (bar STRING)');
	
?>