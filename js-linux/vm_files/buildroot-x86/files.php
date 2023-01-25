<?php
//error_reporting(E_ALL);
//ini_set('display_errors', 1);

//this is a custom script which intercepts filesystem requests and allows files to be mounted at reserved addresses.

Global $mounted_files;
$mounted_files = array(
	"0000000001100000" => "outguess-0.2.tar.gz",
	"0000000001200000" => "outguess"
);



$filename = basename($_SERVER['REQUEST_URI'],'?'.$_SERVER['QUERY_STRING']);
if(ctype_xdigit($filename)){
	if(isset($mounted_files[$filename])){
		header("X-File-Status: mounted");
		$filepath = "mounted-files/".$mounted_files[$filename];
		header("Location: ../".$filepath);
		die('redirecting to mounted file');
	}


	$filepath = "files-store/".$filename;
	$httppath = "https://vfsync.org/u/os/buildroot-x86/files/".$filename;
	if(false && !file_exists($filepath)){//this was only used for initial local-testing of the VM
		header("X-File-Status: cache-miss, remote");
		$data=@file_get_contents($httppath);
		if($data===FALSE){
			http_response_code(404);
			die('no such file');
		}
		file_put_contents($filepath,$data);
	}else{
		header("X-File-Status: cache-hit");
	}
	header("Cache-Control: public, max-age=86400");
	header("Location: ../".$filepath, true, 301);
	die('redirecting to cache');
}else{
	http_response_code(403);
	die('filename forbidden');
}

?>