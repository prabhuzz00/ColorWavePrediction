<?php
include "./conn.php";
$connect = new PDO("mysql:host=localhost;dbname=surp235_test", "surp235_test", 'surp235_test');
if (isset($_SERVER['HTTP_ORIGIN'])) {
	// Decide if the origin in $_SERVER['HTTP_ORIGIN'] is one
	// you want to allow, and if so:
	header('Access-Control-Allow-Origin: *');
	header('Access-Control-Allow-Credentials: true');
	header('Access-Control-Max-Age: 1000');
}

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
	if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD'])) {
		// may also be using PUT, PATCH, HEAD etc
		header("Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE");
	}

	if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS'])) {
		header("Access-Control-Allow-Headers: Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization");
	}
	exit(0);
}
$secretKey = 'pmF%2FmJtSzG7unQfCxL7yaL%2FbB9rYhaR0fPVnN4lO5tvXF8pPDUQ%2FB8LVrHpS%2FwiJQpnVfVKL8QwF9T0IEivwz9nJqpmQcvS';

// Get the token from the request header
$headers = getallheaders();
$token = isset($headers['Authorization']) ? $headers['Authorization'] : '';

// Check if the token is valid
if ($token !== 'Bearer ' . $secretKey) {
	header('HTTP/1.0 401 Unauthorized');
	echo 'Unauthorized access';
	exit;
}

// The token is valid, so you can provide API responses here
// For example:
header('Content-Type: application/json');

$res = array('error' => false);
$action = '';
$user = '';

if (isset($_GET['action'])) {

	$action = $_GET['action'];
}
if ($action == 'info') {
	$data = array();
	$user = filter_var($_GET['user'], FILTER_SANITIZE_STRING);
	$per = $_GET['per'];

	$sql22 = "SELECT balance AS userbalance FROM users WHERE username='$user'";
	$result22 = $conn->query($sql22);
	$row22 = mysqli_fetch_array($result22);
	$userbalance = $row22['userbalance'];

	if ($per == "FastParity") {
		$sql2 = "SELECT period FROM period WHERE id=1";
		$result2 = $conn->query($sql2);
		$row2 = mysqli_fetch_array($result2);
		$period = $row2['period'];
	} else if ($per == "Sapre") {
		$sql2 = "SELECT period FROM sapreperiod WHERE id=1";
		$result2 = $conn->query($sql2);
		$row2 = mysqli_fetch_array($result2);
		$period = $row2['period'];
	} else if ($per == "Parity") {
		$sql2 = "SELECT period FROM emredperiod WHERE id=1";
		$result2 = $conn->query($sql2);
		$row2 = mysqli_fetch_array($result2);
		$period = $row2['period'];
	} else if ($per == "Dice") {
		$sql2 = "SELECT period FROM beconeperiod WHERE id=1";
		$result2 = $conn->query($sql2);
		$row2 = mysqli_fetch_array($result2);
		$period = $row2['period'];
	} else if ($per == "Wheelocity") {
		$sql2 = "SELECT period FROM vipperiod WHERE id=1";
		$result2 = $conn->query($sql2);
		$row2 = mysqli_fetch_array($result2);
		$period = $row2['period'];
	} else if ($per == "Wheel") {
		$sql2 = "SELECT period FROM wheelperiod WHERE id=1";
		$result2 = $conn->query($sql2);
		$row2 = mysqli_fetch_array($result2);
		$period = $row2['period'];
	} else if ($per == "AndharBahar") {
		$sql2 = "SELECT period,num FROM abperiod WHERE id=1";
		$result2 = $conn->query($sql2);
		$row2 = mysqli_fetch_array($result2);
		$period = $row2['period'];
		$startnum = $row2['num'];
	} else if ($per == "Minesweeper") {
		$period = 0;
	}


	$opt9 = "SELECT COUNT(*) as total9 FROM `betrec` ";
	$optres9 = $conn->query($opt9);
	$sum9 = mysqli_fetch_assoc($optres9);
	$total = $sum9['total9'];

	$opt22 = "SELECT COUNT(*) as total22 FROM `recharge` WHERE username='$user' ";
	$optres222 = $conn->query($opt22);
	$sum2 = mysqli_fetch_assoc($optres222);
	$total2 = $sum2['total22'];
	$opt220 = "SELECT COUNT(*) as total220 FROM `betting` WHERE username='$user' ";
	$optres2220 = $conn->query($opt220);
	$sum20 = mysqli_fetch_assoc($optres2220);
	$total20 = $sum20['total220'];


	$opt = "SELECT COUNT(*) as total FROM `betting` WHERE username='$user' ";
	$optres = $conn->query($opt);
	$sum = mysqli_fetch_assoc($optres);
	$total1 = $sum['total'];

	if ($per == "AndharBahar") {
		array_push($data, ['balance' => $userbalance], ['total' => $total], ['period' => $period], ['total1' => $total1], ['startnum' => $startnum]);
	} else {
		array_push($data, ['balance' => $userbalance], ['total' => $total], ['period' => $period], ['total1' => $total1], ['rech' => $total2], ['trans' => $total20]);
	}



	echo json_encode($data);
} else if ($action == 'login') {
	$username = trim($_POST["username"]);;
	$password = $_POST['password'];
	$ip = getenv("REMOTE_ADDR");
	function generateToken($length = 32)
	{
		// Generate a random binary token
		$token = random_bytes($length);

		// Convert the binary token to a hexadecimal string
		$hexToken = bin2hex($token);

		return $hexToken;
	};
	$sql = "Select * from users where username='$username' AND password='$password'";
	$result = $conn->query($sql);
	$num = mysqli_num_rows($result);
	$sql1 = "SELECT status FROM users WHERE username='$username'";
	$result1 = $conn->query($sql1);
	$row1 = mysqli_fetch_array($result1);
	$status = $row1['status'];
	$token = generateToken();
	if ($status) {

		$res['error'] = true;
		$res['message'] = "Account Blocked";
	} else {
		if ($num > 0) {
			$sql0 = "UPDATE users set ip='$ip',token='$token' where username='$username' ";
			$conn->query($sql0);
			$res['message'] = "Success";
			$res['token'] = $token;
		} else {
			$res['error'] = true;
			$res['message'] = "Password error.Please check";
		}
		echo json_encode($res);
	}
} else if ($action == 'getuserinfo') {
	$user = filter_var($_GET['user'], FILTER_SANITIZE_STRING);
	$sql = "SELECT id,nickname,username,usercode,ROUND(balance) AS balance,ROUND(bonus) AS bonus,waggering FROM `users` WHERE username='$user'";
	$result = $conn->query($sql);
	$num = mysqli_num_rows($result);
	$userData = array();
	$row = $result->fetch_assoc();
	$usercode = $row['usercode'];
	array_push($userData, $row);
	$sql1 = "SELECT notice FROM notice WHERE id='1'";
	$result1 = $conn->query($sql1);
	$row1 = mysqli_fetch_array($result1);
	$notice = $row1['notice'];
	$opt = "SELECT SUM(amount) as total FROM `bonus` WHERE usercode='$usercode'";
	$optres = $conn->query($opt);
	$sum = mysqli_fetch_assoc($optres);
	if ($sum !== null) {
		$bonus = round($sum['total'], 2);
	} else {
		// Handle the case where $sum is null
		$bonus = 0; // or any other default value
	}
	$opt9 = "SELECT COUNT(*) as total9 FROM `signin` WHERE username='$user' ";
	$optres9 = $conn->query($opt9);
	$sum9 = mysqli_fetch_assoc($optres9);

	if ($sum9['total9'] == "") {
		$bonus9 = 0;
	} else {
		$bonus9 = $sum9['total9'];
	}
	$opt1 = "SELECT SUM(withdraw) as total FROM `record` WHERE username=$user AND status='Applying'";
	$optres1 = $conn->query($opt1);
	$sum1 = mysqli_fetch_assoc($optres1);
	$hold = round($sum1['total'], 2);
	$opt9t = "SELECT COUNT(*) as total9 FROM `signin` WHERE username='$user' AND DATE(`created`) =date(now()-interval 12 hour)";
	$optres9t = $conn->query($opt9t);
	$sum9t = mysqli_fetch_assoc($optres9t);

	if ($sum9t['total9'] == "" || $sum9t['total9'] == "0") {
		$bonus9t = "Not signed in";
	} else {
		$bonus9t = "Had signed in";
	}
	array_push($userData, ['notice' => $notice], ['bonus' => $bonus], ['days' => $bonus9], ['status' => $bonus9t], ['hold' => $hold]);
	$res['error'] = false;
	$res['user_Data'] = $userData;
	echo json_encode($userData);
} else if ($action == 'verifytoken') {
	$user = filter_var($_GET['user'], FILTER_SANITIZE_STRING);
	$sql = "SELECT token FROM `users` WHERE username='$user'";
	$result = $conn->query($sql);
	$userData = array();
	$row = $result->fetch_assoc();
	array_push($userData, $row);
	$res['error'] = false;
	$res['user_Data'] = $userData;
	echo json_encode($userData);
} else if ($action == 'crashgamedata') {

	$end = 20;
	$query = "SELECT id,crashpoint FROM crashgamerecord  ORDER BY id DESC LIMIT " . $end;
	$statement = $connect->prepare($query);
	$statement->execute();
	while ($row = $statement->fetch(PDO::FETCH_ASSOC)) {
		$data[] = $row;
	}
	echo json_encode($data);
} else if ($action == 'resultrecord') {
	$server = $_GET['server'];
	if ($server == "FastParity") {
		$end = 300;
		$st = 0;
		$query = "SELECT * FROM betrec ORDER BY id DESC LIMIT " . $st . ',' . $end;
		$statement = $connect->prepare($query);
		$statement->execute();
	} else if ($server == "Parity") {
		$end = 300;
		$st = 0;
		$query = "SELECT * FROM emredbetrec ORDER BY id DESC LIMIT " . $st . ',' . $end;
		$statement = $connect->prepare($query);
		$statement->execute();
	} else if ($server == "Sapre") {
		$end = 300;
		$st = 0;
		$query = "SELECT * FROM saprebetrec ORDER BY id DESC LIMIT " . $st . ',' . $end;
		$statement = $connect->prepare($query);
		$statement->execute();
	} else if ($server == "Dice") {
		$end = 300;
		$st = 0;
		$query = "SELECT * FROM beconebetrec ORDER BY id DESC LIMIT " . $st . ',' . $end;
		$statement = $connect->prepare($query);
		$statement->execute();
	} else if ($server == "Wheelocity") {
		$end = 300;
		$st = 0;
		$query = "SELECT * FROM vipbetrec ORDER BY id DESC LIMIT " . $st . ',' . $end;
		$statement = $connect->prepare($query);
		$statement->execute();
	} else if ($server == "Wheel") {
		$end = 300;
		$st = 0;
		$query = "SELECT * FROM wheelbetrec ORDER BY id DESC LIMIT " . $st . ',' . $end;
		$statement = $connect->prepare($query);
		$statement->execute();
	} else if ($server == "AndharBahar") {
		$end = 300;
		$st = 0;
		$query = "SELECT * FROM abbetrec ORDER BY id DESC LIMIT " . $st . ',' . $end;
		$statement = $connect->prepare($query);
		$statement->execute();
	}

	while ($row = $statement->fetch(PDO::FETCH_ASSOC)) {
		$data[] = $row;
	}

	echo json_encode($data);
} else if ($action == 'transrecord') {

	$user = filter_var($_GET['user'], FILTER_SANITIZE_STRING);
	$sql1 = "SELECT usercode FROM users WHERE username='$user'";
	$result1 = $conn->query($sql1);
	$row1 = mysqli_fetch_array($result1);
	$user_code = $row1['usercode'];
	$end = 300;
	$st = 0;
	$query = "SELECT * FROM trans WHERE username='$user' OR username ='$user_code' ORDER BY id DESC LIMIT " . $st . ',' . $end;
	$statement = $connect->prepare($query);
	$statement->execute();


	while ($row = $statement->fetch(PDO::FETCH_ASSOC)) {
		$data[] = $row;
	}

	echo json_encode($data);
} else if ($action == 'result') {
	$server = $_GET['server'];
	if ($server == "FastParity") {
		$sql2 = "SELECT period FROM period WHERE id=1";
		$result2 = $conn->query($sql2);
		$row2 = mysqli_fetch_array($result2);
		$period = $row2['period'];
		$cal = $period % 10;
		$limit = 19 + $cal;
		$query = "SELECT * FROM betrec ORDER BY id DESC LIMIT " . $limit;
		$statement = $connect->prepare($query);
		$statement->execute();
	} else if ($server == "Parity") {
		$sql2 = "SELECT period FROM emredperiod WHERE id=1";
		$result2 = $conn->query($sql2);
		$row2 = mysqli_fetch_array($result2);
		$period = $row2['period'];
		$cal = $period % 10;
		$limit = 19 + $cal;
		$query = "SELECT * FROM emredbetrec ORDER BY id DESC LIMIT " . $limit;
		$statement = $connect->prepare($query);
		$statement->execute();
	} else if ($server == "Sapre") {
		$sql2 = "SELECT period FROM sapreperiod WHERE id=1";
		$result2 = $conn->query($sql2);
		$row2 = mysqli_fetch_array($result2);
		$period = $row2['period'];
		$cal = $period % 10;
		$limit = 19 + $cal;
		$query = "SELECT * FROM saprebetrec ORDER BY id DESC LIMIT " . $limit;
		$statement = $connect->prepare($query);
		$statement->execute();
	} else if ($server == "Dice") {
		$sql2 = "SELECT period FROM beconeperiod WHERE id=1";
		$result2 = $conn->query($sql2);
		$row2 = mysqli_fetch_array($result2);
		$period = $row2['period'];
		$cal = $period % 10;
		$limit = 19 + $cal;
		$query = "SELECT * FROM beconebetrec ORDER BY id DESC LIMIT " . $limit;
		$statement = $connect->prepare($query);
		$statement->execute();
	} else if ($server == "Wheelocity") {
		$sql2 = "SELECT period FROM vipperiod WHERE id=1";
		$result2 = $conn->query($sql2);
		$row2 = mysqli_fetch_array($result2);
		$period = $row2['period'];
		$limit = 9;
		$query = "SELECT * FROM vipbetrec ORDER BY id DESC LIMIT " . $limit;
		$statement = $connect->prepare($query);
		$statement->execute();
	} else if ($server == "Wheel") {
		$sql2 = "SELECT period FROM wheelperiod WHERE id=1";
		$result2 = $conn->query($sql2);
		$row2 = mysqli_fetch_array($result2);
		$period = $row2['period'];
		$limit = 18;
		$query = "SELECT * FROM wheelbetrec ORDER BY id DESC LIMIT " . $limit;
		$statement = $connect->prepare($query);
		$statement->execute();
	} else if ($server == "AndharBahar") {
		$sql2 = "SELECT period FROM abperiod WHERE id=1";
		$result2 = $conn->query($sql2);
		$row2 = mysqli_fetch_array($result2);
		$period = $row2['period'];
		$cal = $period % 10;
		$limit = 19 + $cal;
		$query = "SELECT * FROM abbetrec ORDER BY id DESC LIMIT " . $limit;
		$statement = $connect->prepare($query);
		$statement->execute();
	}

	while ($row = $statement->fetch(PDO::FETCH_ASSOC)) {
		$data[] = $row;
	}
	$data = array_reverse($data);
	echo json_encode($data);
} else if ($action == 'reset') {
	$user = $_POST['username'];
	$otp = $_POST["code"];

	$query0 =  "SELECT  username FROM verify  WHERE otp='$otp' ORDER BY id DESC";
	$result3 = $conn->query($query0);
	$row3 = mysqli_fetch_assoc($result3);
	if (isset($row3['username'])) {
		$verun = $row3['username'];
	} else {
		$verun = "none";
	}

	if ($verun == $user) {
		$username = $_POST['username'];
		$password = $_POST['password'];

		$data = array();
		$opt9 = "SELECT COUNT(*) as total9 FROM `users` WHERE username = '$username' ";
		$optres9 = $conn->query($opt9);
		$sum9 = mysqli_fetch_assoc($optres9);
		$usernum = $sum9['total9'];
		if ($usernum == 1) {


			$query = "UPDATE users SET password='$password' WHERE username='$username'";
			$statement = $connect->prepare($query);
			$statement->execute();
			$status = "success";
			array_push($data, ['status' => $status]);
			echo json_encode($data);
		} else {
			$status = "User Does not exists";
			array_push($data, ['status' => $status]);
			echo json_encode($data);
		}
	} else {



		$data = array();
		$status = "Incorrect otp";
		array_push($data, ['status' => $status]);
		echo json_encode($data);
	}
} elseif ($action == 'changenickname') {
	$username = filter_var($_GET['user'], FILTER_SANITIZE_STRING);
	$nickname = $_GET['nickname'];
	$query = "UPDATE users SET nickname='$nickname' WHERE username='$username'";
	$statement = $connect->prepare($query);
	$statement->execute();
} elseif ($action == 'changepassword') {
	$username = filter_var($_GET['user'], FILTER_SANITIZE_STRING);
	$password = $_GET['password'];
	$query = "UPDATE users SET password='$password' WHERE username='$username'";
	$statement = $connect->prepare($query);
	$statement->execute();
} else if ($action == 'reward') {
	$data1 = array();
	$user = filter_var($_GET['user'], FILTER_SANITIZE_STRING);
	$sql1 = "SELECT usercode FROM users WHERE username='$user'";
	$result1 = $conn->query($sql1);
	$row1 = mysqli_fetch_array($result1);
	$user_code = $row1['usercode'];
	$end1 = 10;
	$page1 = $_GET['page1'];
	$st1 = ($page1 - 1) * $end1;
	$query = "SELECT * FROM bonus WHERE usercode='$user_code' ORDER BY id DESC LIMIT " . $st1 . ',' . $end1;
	$statement = $connect->prepare($query);
	$statement->execute();
	while ($row = $statement->fetch(PDO::FETCH_ASSOC)) {
		$data1[] = $row;
	}

	echo json_encode($data1);
} else if ($action == 'todaysign') {
	$user = $_GET['username'];
	$sql7 = "INSERT INTO signin (username,amount) VALUES ('$user',0)";
	$conn->query($sql7);
	$sql9 = "UPDATE users SET  balance = balance WHERE username='$user'";
	$conn->query($sql9);
} else if ($action == 'minewin') {

	$user = filter_var($_POST['user'], FILTER_SANITIZE_STRING);
	$winamount = $_POST['winamount'];
	$pass = $_POST['pass'] + 1;
	date_default_timezone_set("Asia/Calcutta");
	$akshay = date('Y-m-d H:i:s');
	$data = array();
	$addwin = "UPDATE mine SET res='success', status ='successfull',number='$pass',win='$winamount'  WHERE username = '$user' AND status ='pending'";
	$conn->query($addwin);
	$sql9 = "UPDATE users SET  balance = balance+$winamount WHERE username='$user'";
	$conn->query($sql9);
	$transquery = "INSERT INTO trans (username,reason,amount,type,time) VALUES ('$user','Minesweeper Income',$winamount,'add','$akshay')";
	$conn->query($transquery);
	$status = "Success";



	array_push($data, ['status' => $status]);
	echo json_encode($data);
} else if ($action == 'minesettings') {
	$sql = "SELECT * FROM `mine_setting` WHERE id=1";
	$result = $conn->query($sql);
	$num = mysqli_num_rows($result);
	$data = array();
	$row = $result->fetch_assoc();
	array_push($data, $row);
	echo json_encode($data);
} else if ($action == 'mineloss') {

	$user = filter_var($_GET['user'], FILTER_SANITIZE_STRING);
	date_default_timezone_set("Asia/Calcutta");
	$akshay = date('Y-m-d H:i:s');
	$data = array();
	$addloss = "UPDATE mine SET res='fail', status ='successfull',number=0  WHERE username = '$user' AND status ='pending'";
	$conn->query($addloss);
	$status = "Success";
	array_push($data, ['status' => $status]);
	echo json_encode($data);
} else if ($action == 'dailysign') {
	$data = array();
	$user = $_GET['username'];
	$opt9 = "SELECT COUNT(*) as total9 FROM `signin` WHERE username='$user' ";
	$optres9 = $conn->query($opt9);
	$sum9 = mysqli_fetch_assoc($optres9);

	if ($sum9['total9'] == "") {
		$days = 0;
	} else {
		$days = $sum9['total9'];
	}
	$opt9t = "SELECT COUNT(*) as total9 FROM `signin` WHERE username='$user' AND DATE(`created`) >= NOW() - INTERVAL 1 DAY";
	$optres9t = $conn->query($opt9t);
	$sum9t = mysqli_fetch_assoc($optres9t);

	if ($sum9t['total9'] == "" || $sum9t['total9'] == "0") {
		$status = "Not signed in";
	} else {
		$status = "Had signed in";
	}
	$opt90 = "SELECT sum(amount) as total90 FROM `signin` WHERE username='$user' ";
	$optres90 = $conn->query($opt90);
	$sum90 = mysqli_fetch_assoc($optres90);

	if ($sum90['total90'] == "") {
		$total = 0;
	} else {
		$total = $sum90['total90'];
	}
	$opt900 = "SELECT amount  FROM `signin` WHERE username='$user'  ORDER BY id DESC";
	$optres900 = $conn->query($opt900);
	$sum900 = mysqli_fetch_assoc($optres900);


	$tam = $sum900['amount'];;



	array_push($data, ['status' => $status, 'days' => $days, 'tam' => $tam, 'total' => $total]);
	echo json_encode($data);
} else if ($action == 'betrec') {
	$data1 = array();
	$user = filter_var($_GET['user'], FILTER_SANITIZE_STRING);
	$server = $_GET['server'];
	if (isset($_GET['type'])) {
		$type = $_GET['type'];
	} else {
		$type = "none";
	}


	if ($type == "order") {
		$st1 = 500;
	} else {
		$st1 = 10;
	}

	if ($server == "FastParity") {
		$query = "SELECT * FROM betting WHERE username='$user' ORDER BY id DESC LIMIT " . $st1;
	} else if ($server == "Parity") {
		$query = "SELECT * FROM emredbetting WHERE username='$user' ORDER BY id DESC LIMIT " . $st1;
	} else if ($server == "Sapre") {
		$query = "SELECT * FROM saprebetting WHERE username='$user' ORDER BY id DESC LIMIT " . $st1;
	} else if ($server == "Dice") {
		$query = "SELECT * FROM beconebetting WHERE username='$user' ORDER BY id DESC LIMIT " . $st1;
	} else if ($server == "Wheelocity") {
		$query = "SELECT * FROM vipbetting WHERE username='$user' ORDER BY id DESC LIMIT " . $st1;
	} else if ($server == "Wheel") {
		$query = "SELECT * FROM wheelbetting WHERE username='$user' ORDER BY id DESC LIMIT " . $st1;
	} else if ($server == "AndharBahar") {
		$query = "SELECT * FROM abbetting WHERE username='$user' ORDER BY id DESC LIMIT " . $st1;
	} else if ($server == "Crash") {
		$query = "SELECT * FROM crashbetrecord WHERE username='$user' ORDER BY id DESC LIMIT " . $st1;
	} else if ($server == "Minesweeper") {
		$query = "SELECT * FROM mine WHERE username='$user' ORDER BY id DESC LIMIT " . $st1;
	}

	$statement = $connect->prepare($query);
	$statement->execute();
	while ($row = $statement->fetch(PDO::FETCH_ASSOC)) {
		$data1[] = $row;
	}

	echo json_encode($data1);
} else if ($action == 'bet') {
	$data = array();
	$user = $_POST['username'];
	$period = $_POST['period'];
	$ans = $_POST['ans'];
	$amount = $_POST['amount'];
	$server = $_GET['server'];
	if ($server == "FastParity") {
		$sql2 = "INSERT INTO betting (username,period,ans,amount) VALUES ('$user', $period,'$ans',$amount)";
		$transquery = "INSERT INTO trans (username,reason,amount,type) VALUES ('$user','FastParity order expense',$amount,'sub')";
		$conn->query($transquery);
	} else if ($server == "Parity") {
		$sql2 = "INSERT INTO emredbetting (username,period,ans,amount) VALUES ('$user', $period,'$ans',$amount)";
		$transquery = "INSERT INTO trans (username,reason,amount,type) VALUES ('$user','Parity order expense',$amount,'sub')";
		$conn->query($transquery);
	} else if ($server == "Sapre") {
		$sql2 = "INSERT INTO saprebetting (username,period,ans,amount) VALUES ('$user', $period,'$ans',$amount)";
		$transquery = "INSERT INTO trans (username,reason,amount,type) VALUES ('$user','Sapre order expense',$amount,'sub')";
		$conn->query($transquery);
	} else if ($server == "Dice") {
		$sql2 = "INSERT INTO beconebetting (username,period,ans,amount) VALUES ('$user', $period,'$ans',$amount)";
		$transquery = "INSERT INTO trans (username,reason,amount,type) VALUES ('$user','Dice order expense',$amount,'sub')";
		$conn->query($transquery);
	} else if ($server == "Wheelocity") {
		$sql2 = "INSERT INTO vipbetting (username,period,ans,amount) VALUES ('$user', $period,'$ans',$amount)";
		$transquery = "INSERT INTO trans (username,reason,amount,type) VALUES ('$user','Circle order expense',$amount,'sub')";
		$conn->query($transquery);
	} else if ($server == "Wheel") {
		$sql2 = "INSERT INTO wheelbetting (username,period,ans,amount) VALUES ('$user', $period,'$ans',$amount)";
		$transquery = "INSERT INTO trans (username,reason,amount,type) VALUES ('$user','WheeloCity order expense',$amount,'sub')";
		$conn->query($transquery);
	} else if ($server == "AndharBahar") {
		$sql2 = "INSERT INTO abbetting (username,period,ans,amount) VALUES ('$user', $period,'$ans',$amount)";
		$transquery = "INSERT INTO trans (username,reason,amount,type) VALUES ('$user','AndharBahar order expense',$amount,'sub')";
		$conn->query($transquery);
	} else if ($server == "Minesweeper") {
		$loss = "UPDATE mine SET res='fail', status ='successfull',number=0  WHERE username = '$user' AND status ='pending'";
		$conn->query($loss);
		$sql2 = "INSERT INTO mine (username,period,ans,amount,time) VALUES ('$user', '$period','$ans',$amount,'$akshay')";
		$transquery = "INSERT INTO trans (username,reason,amount,type,time) VALUES ('$user','MInesweeper order expense',$amount,'sub','$akshay')";
		$conn->query($transquery);
		$winner0 = $user;
		$fbets0 = $amount;
		$b1 = (40 / 100) * (2 / 100) * $fbets0;
		$b2 = (20 / 100) * (2 / 100) * $fbets0;
		$b3 = (10 / 100) * (2 / 100) * $fbets0;

		$uc = "SELECT refcode,refcode1,refcode2 FROM users WHERE username='$winner0'";
		$ucc = $conn->query($uc);
		$getuc = mysqli_fetch_assoc($ucc);
		$r = $getuc['refcode'];
		$r1 = $getuc['refcode1'];
		$r2 = $getuc['refcode2'];

		if ($r != "") {
			$addb1 = "UPDATE users SET bonus=bonus +$b1 WHERE usercode='$r'";
			$conn->query($addb1);
			$recb1 = "INSERT INTO bonus (giver,usercode,amount,level,created_at) VALUES ('$winner0','$r','$b1','1','$akshay')";
			$conn->query($recb1);
			if ($r1 != "") {
				$addb2 = "UPDATE users SET bonuse=bonus +$b2 WHERE usercode='$r1'";
				$conn->query($addb2);
				$recb2 = "INSERT INTO bonus (giver,usercode,amount,level,created_at) VALUES ('$winner0','$r1','$b2','2','$akshay')";
				$conn->query($recb2);
				if ($r2 != "") {
					$addb3 = "UPDATE users SET bonus=bonus +$b3 WHERE usercode='$r2'";
					$conn->query($addb3);
					$recb2 = "INSERT INTO bonus (giver,usercode,amount,level,created_at) VALUES ('$winner0','$r2','$b3','3','$akshay')";
					$conn->query($recb2);
				}
			}
		}
	}

	$sql = "UPDATE users
SET waggering = CASE
    WHEN waggering >= $amount THEN waggering - $amount
    ELSE 0
  END,
  balance = CASE
    WHEN balance >= $amount THEN balance - $amount
    ELSE balance
  END
WHERE username = '$user'";
	$conn->query($sql);
	$result = $conn->query($sql2);
	if ($result === true) {
		$status = "Bet Added Successfully";
	} else {
		$status = "Somthing Went Wrong";
	}
	array_push($data, ['status' => $status], ['amount' => $amount], ['ans' => $ans], ['user' => $user]);
	echo json_encode($data);
} else if ($action == 'withdrawal') {
	$data = array();
	$user = filter_var($_GET['user'], FILTER_SANITIZE_STRING);
	$upi = $_GET['upi'];
	$amount1 = $_GET['amount'];

	$sql3 = "SELECT * FROM users WHERE username='$user'";
	$result3 = $conn->query($sql3);
	$row3 = mysqli_fetch_assoc($result3);
	$account = $row3['account'];
	$ifsc = $row3['ifsc'];
	$name = $row3['name'];
	$bankname = $row3['bankname'];
	$sql14 = "SELECT COUNT(*) AS wcount FROM record WHERE username = '$user' AND created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)";
	$result14 = $conn->query($sql14);
	$row14 = mysqli_fetch_array($result14);
	$wcount = $row14['wcount'];

	$opt22 = "SELECT SUM(recharge) as total22 FROM `recharge` WHERE username='$user' AND status='Success' ";
	$optres222 = $conn->query($opt22);
	$sum2 = mysqli_fetch_assoc($optres222);
	$total2 = $sum2['total22'];
	$opt = "SELECT SUM(amount) as total FROM `abbetting` WHERE username='$user'";
	$optres = $conn->query($opt);
	$sum = mysqli_fetch_assoc($optres);
	if ($sum['total'] == "") {
		$bonus = 0;
	} else {
		$bonus = round($sum['total'], 2);
	}
	$opt1 = "SELECT SUM(amount) as total1 FROM `betting` WHERE username='$user'";
	$optres1 = $conn->query($opt1);
	$sum1 = mysqli_fetch_assoc($optres1);
	if ($sum1['total1'] == "") {
		$bonus1 = 0;
	} else {
		$bonus1 = round($sum1['total1'], 2);
	}
	$opt2 = "SELECT SUM(amount) as total2 FROM `saprebetting` WHERE username='$user'";
	$optres2 = $conn->query($opt2);
	$sum2 = mysqli_fetch_assoc($optres2);
	if ($sum2['total2'] == "") {
		$bonus2 = 0;
	} else {
		$bonus2 = round($sum2['total2'], 2);
	}
	$opt3 = "SELECT SUM(amount) as total3 FROM `emredbetting` WHERE username='$user'";
	$optres3 = $conn->query($opt3);
	$sum3 = mysqli_fetch_assoc($optres3);
	if ($sum3['total3'] == "") {
		$bonus3 = 0;
	} else {
		$bonus3 = round($sum['total3'], 2);
	}
	$opt4 = "SELECT SUM(amount) as total4 FROM `beconebetting` WHERE username='$user'";
	$optres4 = $conn->query($opt4);
	$sum4 = mysqli_fetch_assoc($optres4);
	if ($sum4['total4'] == "") {
		$bonus4 = 0;
	} else {
		$bonus4 = round($sum['total4'], 2);
	}
	$opt5 = "SELECT SUM(amount) as total5 FROM `crashbetrecord` WHERE username='$user'";
	$optres5 = $conn->query($opt5);
	$sum5 = mysqli_fetch_assoc($optres5);
	if ($sum5['total5'] == "") {
		$bonus5 = 0;
	} else {
		$bonus5 = round($sum['total5'], 2);
	}

	if ($total2 > 0) {
		if ($wcount <= 4) {



			if ($_GET['amount'] > 1500) {
				$amount = (98 / 100) * $_GET['amount'];
			} else {
				$amount = $_GET['amount'] - 30;
			}

			function random_strings($length_of_string)
			{

				// String of all alphanumeric character
				$str_result = '0123456789AXYZ012345678901234567890123456789';

				// Shuffle the $str_result and returns substring
				// of specified length
				return substr(
					str_shuffle($str_result),
					0,
					$length_of_string
				);
			}

			$r = random_strings(12);


			$rand =  $r;

			$sql2 = "INSERT INTO record (username,withdraw,rand,upi,name,bankname,account,ifsc) VALUES ('$user', $amount,'$rand','$upi','$name','$bankname','$account','$ifsc')";
			$sql = "UPDATE users SET  balance = balance-$amount1 WHERE username='$user'";
			$transquery = "INSERT INTO trans (username,reason,amount,type) VALUES ('$user','Withdrawal',$amount,'sub')";
			$conn->query($transquery);
			$res1 = $conn->query($sql);
			$result = $conn->query($sql2);
			if ($result === true && $res1 === true) {
				$status = "Success";
			} else {
				$status = "Somthing Went Wrong";
			}
		} else {
			$status = "Daily Withdraw Limit Reached";
		}
	} else {
		$status = "Need first recharge to withdraw";
	}


	array_push($data, ['status' => $status]);
	echo json_encode($data);
} else if ($action == 'Invitewithdrawal') {
	$data = array();
	$user = filter_var($_GET['user'], FILTER_SANITIZE_STRING);
	$upi = $_GET['upi'];
	$amount1 = $_GET['amount'];

	$sql14 = "SELECT COUNT(*) AS wcount FROM record WHERE username = '$user' AND created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)";
	$result14 = $conn->query($sql14);
	$row14 = mysqli_fetch_array($result14);
	$wcount = $row14['wcount'];

	$opt22 = "SELECT SUM(recharge) as total22 FROM `recharge` WHERE username='$user' AND status='Success' ";
	$optres222 = $conn->query($opt22);
	$sum2 = mysqli_fetch_assoc($optres222);
	$total2 = $sum2['total22'];
	$opt = "SELECT SUM(amount) as total FROM `abbetting` WHERE username='$user'";
	$optres = $conn->query($opt);
	$sum = mysqli_fetch_assoc($optres);
	if ($sum['total'] == "") {
		$bonus = 0;
	} else {
		$bonus = round($sum['total'], 2);
	}
	$opt1 = "SELECT SUM(amount) as total1 FROM `betting` WHERE username='$user'";
	$optres1 = $conn->query($opt1);
	$sum1 = mysqli_fetch_assoc($optres1);
	if ($sum1['total1'] == "") {
		$bonus1 = 0;
	} else {
		$bonus1 = round($sum1['total1'], 2);
	}
	$opt2 = "SELECT SUM(amount) as total2 FROM `saprebetting` WHERE username='$user'";
	$optres2 = $conn->query($opt2);
	$sum2 = mysqli_fetch_assoc($optres2);
	if ($sum2['total2'] == "") {
		$bonus2 = 0;
	} else {
		$bonus2 = round($sum2['total2'], 2);
	}
	$opt3 = "SELECT SUM(amount) as total3 FROM `emredbetting` WHERE username='$user'";
	$optres3 = $conn->query($opt3);
	$sum3 = mysqli_fetch_assoc($optres3);
	if ($sum3['total3'] == "") {
		$bonus3 = 0;
	} else {
		$bonus3 = round($sum['total3'], 2);
	}
	$opt4 = "SELECT SUM(amount) as total4 FROM `beconebetting` WHERE username='$user'";
	$optres4 = $conn->query($opt4);
	$sum4 = mysqli_fetch_assoc($optres4);
	if ($sum4['total4'] == "") {
		$bonus4 = 0;
	} else {
		$bonus4 = round($sum['total4'], 2);
	}
	$opt5 = "SELECT SUM(amount) as total5 FROM `crashbetrecord` WHERE username='$user'";
	$optres5 = $conn->query($opt5);
	$sum5 = mysqli_fetch_assoc($optres5);
	if ($sum5['total5'] == "") {
		$bonus5 = 0;
	} else {
		$bonus5 = round($sum['total5'], 2);
	}

	if ($total2 > 0) {
		if ($wcount <= 4) {
			$amount = $_GET['amount'];


			function random_strings($length_of_string)
			{

				// String of all alphanumeric character
				$str_result = '0123456789AXYZ012345678901234567890123456789';

				// Shuffle the $str_result and returns substring
				// of specified length
				return substr(
					str_shuffle($str_result),
					0,
					$length_of_string
				);
			}

			$r = random_strings(12);


			$rand =  $r;

			$sql2 = "INSERT INTO record (username,withdraw,rand,upi,type) VALUES ('$user', $amount,'$rand','$upi','invite')";
			$sql = "UPDATE users SET  bonus = bonus-$amount1 WHERE username='$user'";
			$transquery = "INSERT INTO trans (username,reason,amount,type) VALUES ('$user','Invite Withdrawal',$amount,'sub')";
			$conn->query($transquery);
			$res1 = $conn->query($sql);
			$result = $conn->query($sql2);
			if ($result === true && $res1 === true) {
				$status = "Success";
			} else {
				$status = "Somthing Went Wrong";
			}
		} else {
			$status = "Daily Withdraw Limit Reached";
		}
	} else {
		$status = "Need first recharge to withdraw";
	}


	array_push($data, ['status' => $status]);
	echo json_encode($data);
} else if ($action == 'getcheckinstatus') {
	$data = array();
	$user = filter_var($_GET['user'], FILTER_SANITIZE_STRING);

	$sql14 = "SELECT COUNT(*) AS wcount FROM signin WHERE username = '$user' AND created >= DATE_SUB(NOW(), INTERVAL 24 HOUR)";
	$result14 = $conn->query($sql14);
	$row14 = mysqli_fetch_array($result14);
	$wcount = $row14['wcount'];
	$sql144 = "SELECT COUNT(*) AS scount FROM signin WHERE username = '$user' ";
	$result144 = $conn->query($sql144);
	$row144 = mysqli_fetch_array($result144);

	if ($row144['scount'] == null) {
		$scount = 0;
	} else {
		$scount = $row144['scount'];
	}
	if ($scount < 9) {
		if ($wcount == 0) {
			$status = "true";
		} else {
			$status = "false";
		}
	} else {
		$status = "false";
	}

	array_push($data, ['status' => $status, 'days' => $scount]);
	echo json_encode($data);
} else if ($action == 'checkinuser') {
	$data = array();
	$user = filter_var($_GET['user'], FILTER_SANITIZE_STRING);
	$bon = 0;

	$sql14 = "SELECT COUNT(*) AS wcount FROM signin WHERE username = '$user' AND created >= DATE_SUB(NOW(), INTERVAL 24 HOUR)";
	$result14 = $conn->query($sql14);
	$row14 = mysqli_fetch_array($result14);
	$wcount = $row14['wcount'];
	$sql144 = "SELECT COUNT(*) AS scount FROM signin WHERE username = '$user' ";
	$result144 = $conn->query($sql144);
	$row144 = mysqli_fetch_array($result144);
	if ($row144['scount'] == null) {
		$scount = 0;
	} else {
		$scount = $row144['scount'];
	}

	$opt22 = "SELECT COUNT(*) as total22 FROM `recharge` WHERE username='$user' AND status='Success' ";
	$optres222 = $conn->query($opt22);
	$sum2 = mysqli_fetch_assoc($optres222);
	$total2 = $sum2['total22'];
	if ($total2 > 0) {
		if ($wcount == 0) {
			if ($scount == 0) {
				$bon = 1;
			} elseif ($scount == 2 || $scount == 1 || $scount == 3) {
				$bon = 2;
			} elseif ($scount == 6 || $scount == 4 || $scount == 5) {
				$bon = 3;
			} else {
				$bon = mt_rand(5, 10);
			}
			$sql7 = "INSERT INTO signin (username,amount) VALUES ('$user',$bon)";
			$conn->query($sql7);
			$sql9 = "UPDATE users SET  balance = balance+$bon WHERE username='$user'";
			$conn->query($sql9);
			$transquery = "INSERT INTO trans (username,reason,amount,type) VALUES ('$user','CheckIn Bonus',$bon,'add')";
			$conn->query($transquery);
			$status = "Success";
		} else {
			$status = "Already Checked In";
		}
	} else {
		$status = "Recharge your wallet, to get this reward";
	}
	array_push($data, ['status' => $status]);
	echo json_encode($data);
} else if ($action == 'rechargerecord') {
	$data1 = array();
	$user = filter_var($_GET['user'], FILTER_SANITIZE_STRING);
	$end1 = 10;
	$page1 = $_GET['page1'];
	$st1 = ($page1 - 1) * $end1;
	$query = "SELECT * FROM recharge WHERE username='$user' ORDER BY id DESC LIMIT " . $st1 . ',' . $end1;
	$statement = $connect->prepare($query);
	$statement->execute();
	while ($row = $statement->fetch(PDO::FETCH_ASSOC)) {
		$data1[] = $row;
	}

	echo json_encode($data1);
} else if ($action == 'complaintrecord') {
	$data1 = array();
	$user = filter_var($_GET['user'], FILTER_SANITIZE_STRING);
	$query = "SELECT * FROM complaint WHERE username='$user' ORDER BY id DESC";
	$statement = $connect->prepare($query);
	$statement->execute();
	while ($row = $statement->fetch(PDO::FETCH_ASSOC)) {
		$data1[] = $row;
	}

	echo json_encode($data1);
} else if ($action == 'trans') {
	$data1 = array();
	$user = filter_var($_GET['user'], FILTER_SANITIZE_STRING);
	$end1 = 10;
	$page1 = $_GET['page1'];
	$st1 = ($page1 - 1) * $end1;
	$query = "SELECT * FROM betting WHERE username='$user' ORDER BY id DESC LIMIT " . $st1 . ',' . $end1;
	$statement = $connect->prepare($query);
	$statement->execute();
	while ($row = $statement->fetch(PDO::FETCH_ASSOC)) {
		$data1[] = $row;
	}

	echo json_encode($data1);
} else if ($action == 'invite') {
	$data = array();
	$username = $_GET['usercode'];
	$sql1 = "SELECT usercode,bonus FROM users WHERE username='$username'";
	$result1 = $conn->query($sql1);
	$row1 = mysqli_fetch_array($result1);
	$usercode = $row1['usercode'];
	$agentincome = $row1['bonus'];

	$opt99 = "SELECT SUM(amount) as total99 FROM `bonus` WHERE usercode='$usercode' ";
	$optres99 = $conn->query($opt99);
	$sum99 = mysqli_fetch_assoc($optres99);
	if ($sum99['total99'] == null) {
		$totalb = 0;
	} else {
		$totalb = round($sum99['total99'], 2);
	}


	$opt999 = "SELECT SUM(amount) as total999 FROM `bonus` WHERE usercode='$usercode'  AND created_at>= NOW() - INTERVAL 1 DAY";
	$optres999 = $conn->query($opt999);
	$sum999 = mysqli_fetch_assoc($optres999);
	if ($sum999['total999'] == null) {
		$todaytotalb = 0;
	} else {
		$todaytotalb = round($sum999['total999'], 2);
	}



	$opt9 = "SELECT COUNT(*) as total9 FROM `users` WHERE refcode='$usercode' OR refcode1='$usercode' OR refcode2='$usercode'";
	$optres9 = $conn->query($opt9);
	$sum9 = mysqli_fetch_assoc($optres9);
	$total = $sum9['total9'];




	$opt = "SELECT COUNT(*) as total
FROM `users`
WHERE (refcode = '$usercode' OR refcode1 = '$usercode' OR refcode2 = '$usercode')
AND created_at >= NOW() - INTERVAL 24 HOUR;
";
	$optres = $conn->query($opt);
	$sum = mysqli_fetch_assoc($optres);
	$total1 = $sum['total'];

	array_push($data, ['totalbonus' => $totalb, 'agentincome' => $agentincome, 'totalinvites' => $total, 'todaybonus' => $todaytotalb, 'todayinvites' => $total1]);
	echo json_encode($data);
} else if ($action == 'withdrawrecord') {
	$data1 = array();
	$user = filter_var($_GET['user'], FILTER_SANITIZE_STRING);
	$end1 = 10;
	$page1 = $_GET['page1'];
	$st1 = ($page1 - 1) * $end1;
	$query = "SELECT * FROM record WHERE username='$user' ORDER BY id DESC LIMIT " . $st1 . ',' . $end1;
	$statement = $connect->prepare($query);
	$statement->execute();
	while ($row = $statement->fetch(PDO::FETCH_ASSOC)) {
		$data1[] = $row;
	}

	echo json_encode($data1);
} else if ($action == 'inviterecord') {
	$data = array();
	$data1 = array();
	$data2 = array();
	$user = filter_var($_GET['user'], FILTER_SANITIZE_STRING);
	$level = $_GET['level'];
	$sql3 = "SELECT usercode FROM users WHERE username='$user'";
	$result3 = $conn->query($sql3);
	$row3 = mysqli_fetch_assoc($result3);
	$usercode = $row3['usercode'];
	if ($level == 'A') {
		$query = "SELECT *,
    CASE
        WHEN refcode = '$usercode' THEN 1
        WHEN refcode1 = '$usercode' THEN 2
        WHEN refcode2 = '$usercode' THEN 3
        ELSE 0  -- Assign a default value when none of the conditions match
    END AS level
FROM users
WHERE refcode = '$usercode' OR refcode1 = '$usercode' OR refcode2 = '$usercode'
ORDER BY id DESC;  ";
	} elseif ($level == 'B') {
		$query = "SELECT *,'1' AS level FROM users WHERE refcode='$usercode'  ORDER BY id DESC ";
	} elseif ($level == 'C') {
		$query = "SELECT *,'2' AS level FROM users WHERE refcode1='$usercode'  ORDER BY id DESC  ";
	} elseif ($level == 'D') {
		$query = "SELECT *,'3' AS level FROM users WHERE refcode2='$usercode'  ORDER BY id DESC  ";
	}
	$statement = $connect->prepare($query);
	$statement->execute();
	while ($row = $statement->fetch(PDO::FETCH_ASSOC)) {
		$data1[] = $row;
	}

	$opt9 = "SELECT COUNT(*) as total9 FROM `users` WHERE refcode='$usercode' ";
	$optres9 = $conn->query($opt9);
	$sum9 = mysqli_fetch_assoc($optres9);
	$total = $sum9['total9'];

	$opt22 = "SELECT COUNT(*) as total22 FROM `users`WHERE refcode1='$usercode'";
	$optres222 = $conn->query($opt22);
	$sum2 = mysqli_fetch_assoc($optres222);
	$total2 = $sum2['total22'];


	$opt = "SELECT COUNT(*) as total FROM `users`  WHERE refcode2='$usercode' ";
	$optres = $conn->query($opt);
	$sum = mysqli_fetch_assoc($optres);
	$total1 = $sum['total'];
	$people = $total + $total1 + $total2;
	array_push($data2, ['people' => $people, 'level1' => $total, 'level2' => $total2, 'level3' => $total1]);
	array_push($data, $data1, $data2);

	echo json_encode($data);
} else if ($action == 'invitereward') {
	$data1 = array();
	$user = filter_var($_GET['user'], FILTER_SANITIZE_STRING);
	$level = $_GET['level'];
	$sql3 = "SELECT usercode FROM users WHERE username='$user'";
	$result3 = $conn->query($sql3);
	$row3 = mysqli_fetch_assoc($result3);
	$usercode = $row3['usercode'];
	if ($level == 'A') {
		$query = "SELECT bonus.*, users.id
              FROM bonus
              INNER JOIN users ON bonus.giver = users.username
              WHERE bonus.usercode = '$usercode'
              ORDER BY bonus.id DESC   ";
	} elseif ($level == 'B') {
		$query = "SELECT bonus.*, users.id
              FROM bonus
              INNER JOIN users ON bonus.giver = users.username
              WHERE bonus.usercode = '$usercode' AND bonus.level=5 
              ORDER BY bonus.id DESC ";
	} elseif ($level == 'C') {
		$query = "SELECT bonus.*, users.id
              FROM bonus
              INNER JOIN users ON bonus.giver = users.username
              WHERE bonus.usercode = '$usercode' AND bonus.level=1 OR bonus.level=2 OR bonus.level=3
              ORDER BY bonus.id DESC ";
	} elseif ($level == 'D') {
		$query = "SELECT bonus.*, users.id
              FROM bonus
              INNER JOIN users ON bonus.giver = users.username
              WHERE bonus.usercode = '$usercode' AND bonus.level=4
              ORDER BY bonus.id DESC ";
	}
	$statement = $connect->prepare($query);
	$statement->execute();
	while ($row = $statement->fetch(PDO::FETCH_ASSOC)) {
		$data1[] = $row;
	}



	echo json_encode($data1);
} else if ($action == 'inviterewardopen') {
	$data1 = array();
	$user = filter_var($_GET['user'], FILTER_SANITIZE_STRING);
	$level = $_GET['level'];
	$sql3 = "SELECT usercode FROM users WHERE username='$user'";
	$result3 = $conn->query($sql3);
	$row3 = mysqli_fetch_assoc($result3);
	$usercode = $row3['usercode'];
	if ($level == 'A') {
		$query = "SELECT bonus.*, users.id
FROM bonus
INNER JOIN users ON bonus.giver = users.username
WHERE bonus.usercode = '$usercode'
  AND bonus.created_at >= NOW() - INTERVAL 24 HOUR
ORDER BY bonus.id DESC; ";
	}
	$statement = $connect->prepare($query);
	$statement->execute();
	while ($row = $statement->fetch(PDO::FETCH_ASSOC)) {
		$data1[] = $row;
	}



	echo json_encode($data1);
} else if ($action == 'dailyincome') {
	$data1 = array();
	$user = filter_var($_GET['user'], FILTER_SANITIZE_STRING);
	$sql3 = "SELECT usercode FROM users WHERE username='$user'";
	$result3 = $conn->query($sql3);
	$row3 = mysqli_fetch_assoc($result3);
	$usercode = $row3['usercode'];

	$query = "SELECT DATE(created_at) AS bonus_day, SUM(amount) AS total_amount FROM bonus WHERE usercode = '$usercode' GROUP BY DATE(created_at) ORDER BY bonus_day DESC";

	$statement = $connect->prepare($query);
	$statement->execute();
	while ($row = $statement->fetch(PDO::FETCH_ASSOC)) {
		$data1[] = $row;
	}



	echo json_encode($data1);
} else if ($action == 'bankcard') {
	$data1 = array();
	$user = filter_var($_GET['user'], FILTER_SANITIZE_STRING);

	$query = "SELECT * FROM users WHERE username='$user' ";
	$statement = $connect->prepare($query);
	$statement->execute();
	while ($row = $statement->fetch(PDO::FETCH_ASSOC)) {
		$data1[] = $row;
	}

	echo json_encode($data1);
} else if ($action == 'rcomplaint') {
	$data1 = array();
	$user = filter_var($_GET['user'], FILTER_SANITIZE_STRING);
	$id = filter_var($_GET['id'], FILTER_SANITIZE_STRING);

	$query = "SELECT * FROM recharge WHERE username='$user' AND rand='$id' ";
	$statement = $connect->prepare($query);
	$statement->execute();
	while ($row = $statement->fetch(PDO::FETCH_ASSOC)) {
		$data1[] = $row;
	}

	echo json_encode($data1);
} else if ($action == 'wcomplaint') {
	$data1 = array();
	$user = filter_var($_GET['user'], FILTER_SANITIZE_STRING);
	$id = filter_var($_GET['id'], FILTER_SANITIZE_STRING);

	$query = "SELECT * FROM record WHERE username='$user' AND rand='$id' ";
	$statement = $connect->prepare($query);
	$statement->execute();
	while ($row = $statement->fetch(PDO::FETCH_ASSOC)) {
		$data1[] = $row;
	}

	echo json_encode($data1);
} else if ($action == 'deletebankcard') {

	$user = filter_var($_GET['user'], FILTER_SANITIZE_STRING);

	$query = "UPDATE users SET account='1111111111' WHERE username='$user' ";
	$statement = $connect->prepare($query);
	$statement->execute();
} else if ($action == 'register') {
	$user = $_POST['username'];
	$otp = $_POST["code"];
	$ip = getenv("REMOTE_ADDR");
	$query0 =  "SELECT  username FROM verify  WHERE otp='$otp' ORDER BY id DESC";
	$result3 = $conn->query($query0);
	$row3 = mysqli_fetch_assoc($result3);
	if (isset($row3['username'])) {
		$verun = $row3['username'];
	} else {
		$verun = "none";
	}

	if ($verun == $user) {
		$username = $_POST['username'];
		$password = $_POST['password'];
		$refcode = $_POST['refcode'];
		$data = array();
		$opt9 = "SELECT COUNT(*) as total9 FROM `users` WHERE username = '$username' ";
		$optres9 = $conn->query($opt9);
		$sum9 = mysqli_fetch_assoc($optres9);
		$usernum = $sum9['total9'];
		if ($usernum == 0) {
			function genUserCode()
			{
				$str = "AB1CDE2FG3HI4JK5LM6NO7PQ8RS9TU0VQXYZ" . time();
				$str = str_split($str, 1);
				$l = count($str);
				$user_code = '';
				for ($i = 0; $i < 8; $i++) {
					$tn = rand(0, $l);
					$user_code .= $str[$tn];
				}

				return $user_code;
			}
			$user_code = genUserCode();
			$sql3 = "SELECT refcode,refcode1 FROM users WHERE usercode='$refcode'";
			$result3 = $conn->query($sql3);
			$row3 = mysqli_fetch_assoc($result3);
			$refcode1 = $row3['refcode'];
			$refcode2 = $row3['refcode1'];
			$query = "INSERT INTO users (username, password, refcode,usercode,refcode1,refcode2,r_ip) VALUES ('$username','$password','$refcode','$user_code','$refcode1','$refcode2','$ip')";
			$statement = $connect->prepare($query);
			$statement->execute();
			$transquery = "INSERT INTO trans (username,reason,amount,type) VALUES ('$username','Signup bonus',20,'add')";
			$conn->query($transquery);
			$status = "success";
			array_push($data, ['status' => $status]);
			echo json_encode($data);
		} else {
			$status = "User already exists";
			array_push($data, ['status' => $status]);
			echo json_encode($data);
		}
	} else {



		$data = array();
		$status = "Incorrect otp";
		array_push($data, ['status' => $status]);
		echo json_encode($data);
	}
} else if ($action == 'addrcomplaint') {
	function genTicket()
	{
		$str = "AB1CDE2FG3HI4JK5LM6NO7PQ8RS9TU0VQXYZ0" . time();
		$str = str_split($str, 1);
		$l = count($str);
		$user_code = '';
		for ($i = 0; $i < 8; $i++) {
			$tn = rand(0, $l);
			$user_code .= $str[$tn];
		}

		return $user_code;
	}
	$user = filter_var($_GET['user'], FILTER_SANITIZE_STRING);
	$ticket = genTicket();
	$reason = $_POST['reason'];
	$trxn = $_POST['trxnid'];
	$amount = $_POST['amount'];
	$paidto = $_POST['paidto'];
	$utr = $_POST['utr'];
	$mode = $_POST['mode'];
	$file = $_FILES['screenshot'];
	$uploadDirectory = 'uploads/'; // Set your desired upload directory

	// Ensure the directory exists
	if (!file_exists($uploadDirectory)) {
		mkdir($uploadDirectory, 0777, true);
	}

	$originalFileName = $file['name'];
	$fileExtension = "jpg";

	// Generate a random name for the uploaded image
	$randomName = uniqid() . '.' . $fileExtension;
	$targetPath = $uploadDirectory . $randomName;
	if (move_uploaded_file($file['tmp_name'], $targetPath)) {

		$query = "INSERT INTO complaint (username,Ticket,Support,Transaction,Description,Amount,PaidTo,UTR,Mode,screenshot) VALUES ('$user','$ticket','recharge','$trxn','$reason','$amount','$paidto','$utr','$mode','$randomName') ";
		$statement = $connect->prepare($query);
		$statement->execute();
		$status = "success";
	}

	$data = array();

	array_push($data, ['status' => $status]);
	echo json_encode($data);
} else if ($action == 'addwcomplaint') {
	function genTicket()
	{
		$str = "AB1CDE2FG3HI4JK5LM6NO7PQ8RS9TU0VQXYZ0" . time();
		$str = str_split($str, 1);
		$l = count($str);
		$user_code = '';
		for ($i = 0; $i < 8; $i++) {
			$tn = rand(0, $l);
			$user_code .= $str[$tn];
		}

		return $user_code;
	}
	$user = filter_var($_GET['user'], FILTER_SANITIZE_STRING);
	$ticket = genTicket();
	$reason = $_POST['reason'];
	$desc = $_POST['desc'];
	$refno = genTicket();
	$trxn = $_POST['trxnid'];
	$amount = $_POST['amount'];
	$account = $_POST['account'];
	$ifsc = $_POST['ifsc'];

	$mode = $_POST['mode'];
	$query = "INSERT INTO complaint (username,Ticket,Support,Transaction,refno,Description,Amount,account,ifsc,Mode) VALUES ('$user','$ticket','withdraw','$trxn','$refno','$desc','$amount','$account','$ifsc','$mode') ";
	$statement = $connect->prepare($query);
	$statement->execute();
	$status = "success";
	$data = array();

	array_push($data, ['status' => $status]);
	echo json_encode($data);
} else if ($action == 'addbankcard') {

	$user = filter_var($_GET['user'], FILTER_SANITIZE_STRING);
	$name = $_POST['actualname'];
	$bankname = $_POST['bankname'];
	$account = $_POST['account'];
	$ifsc = $_POST['ifsc'];
	$query = "UPDATE users SET name='$name',bankname='$bankname',account='$account',ifsc='$ifsc' WHERE username='$user' ";
	$statement = $connect->prepare($query);
	$statement->execute();
	$data = array();
	$status = "success";
	array_push($data, ['status' => $status]);
	echo json_encode($data);
} else if ($action == 'settings') {
	$sql = "SELECT * FROM `settings` WHERE id=1";
	$result = $conn->query($sql);
	$num = mysqli_num_rows($result);
	$data = array();
	$row = $result->fetch_assoc();
	array_push($data, $row);
	echo json_encode($data);
} else if ($action == 'task') {

	$user = filter_var($_GET['user'], FILTER_SANITIZE_STRING);
	$sql = "SELECT signuptask,rechargetask FROM `users` WHERE username='$user'";
	$result = $conn->query($sql);
	$num = mysqli_num_rows($result);
	$data = array();
	$row = $result->fetch_assoc();
	array_push($data, $row);
	echo json_encode($data);
} else if ($action == 'claimtask') {

	$user = filter_var($_GET['user'], FILTER_SANITIZE_STRING);
	$task = $_GET['task'];
	$sql3 = "SELECT signuptask,rechargetask FROM users WHERE username='$user'";
	$result3 = $conn->query($sql3);
	$row3 = mysqli_fetch_assoc($result3);
	$signuptask = $row3['signuptask'];
	$rechargetask = $row3['rechargetask'];
	date_default_timezone_set("Asia/Calcutta");
	$akshay = date('Y-m-d H:i:s');
	$data = array();
	if ($task) {
		$opt22 = "SELECT COUNT(*) as total22 FROM `recharge` WHERE username='$user' AND status='Success' ";
		$optres222 = $conn->query($opt22);
		$sum2 = mysqli_fetch_assoc($optres222);
		$total2 = $sum2['total22'];
		if ($task == 1 && $signuptask == 0) {
			$tas = "signuptask";


			$sql9 = "UPDATE users SET  balance = balance+20,$tas=1 WHERE username='$user'";
			$conn->query($sql9);
			$transquery = "INSERT INTO trans (username,reason,amount,type,time) VALUES ('$user','Task Reward',20,'add','$akshay')";
			$conn->query($transquery);
			$status = "Success";
		} else if ($rechargetask == 0) {
			$tas = "rechargetask";
			if ($total2 > 0) {

				$sql9 = "UPDATE users SET  balance = balance+20,$tas=1 WHERE username='$user'";
				$conn->query($sql9);
				$transquery = "INSERT INTO trans (username,reason,amount,type,time) VALUES ('$user','Task Reward',20,'add','$akshay')";
				$conn->query($transquery);
				$status = "Success";
			} else {
				$status = "Please recharge to claim rewrad";
			}
		}
	}


	array_push($data, ['status' => $status]);
	echo json_encode($data);
} else {
	$res['error'] = false;
	$res['message'] = "No Data Found!";
}




$conn->close();
header("Content-type: application/json");
//echo json_encode($res);
die();
