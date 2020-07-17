
import 'package:firebase/firebase.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:purduehcr_web/Config.dart';


class FirebaseUtility{
  static App app;
  static bool connectedToDatabase = false;


  static Future<void> initializeFirebase(Config config){
    if(apps.isEmpty ){
      debugPrint("No App, so initialize Firebase");
      print("Has key: "+ config.apiKey);
      try {
        app = initializeApp(
            apiKey: config.apiKey,
            authDomain: config.authDomain,
            databaseURL: config.databaseURL,
            projectId: config.projectId,
            storageBucket: config.storageBucket);
      }
      catch (err){
        debugPrint("We are ignoring this error");
      }
      return auth().setPersistence(Persistence.SESSION);
    }
    else{
      return Future.value();
    }
  }

  ///Signs in the user and returns the token in the future
  static Future<void> signIn(Config config, String email, String password){
    return initializeFirebase(config).then((_) async {
      try{
        await FirebaseAuth.instance.signInWithEmailAndPassword(email:email, password: password);
      }
      catch(error){
        print("Sign in error code: ${error.code}");
        String errorMessage;
        switch (error.code) {
          case "auth/invalid-email":
            errorMessage = "Your email address appears to be malformed.";
            break;
          case "auth/wrong-password":
            errorMessage = "Please verify your email and password";
            break;
          case "auth/user-not-found":
            errorMessage = "Please verify your email and password";
            break;
          case "auth/user-disabled":
            errorMessage = "User with this email has been disabled.";
            break;
          case "auth/too-many-requests":
            errorMessage = "Too many requests. Try again later.";
            break;
          case "auth/operation-not-allowed":
            errorMessage = "Signing in with Email and Password is not enabled.";
            break;
          default:
            errorMessage = error.toString();
        }
        return Future.error(errorMessage);
      }
    });
  }

  static Future createAccount(Config config, String email, String password){
    return initializeFirebase(config).then((value) async {
      try{
        await FirebaseAuth.instance.createUserWithEmailAndPassword(email: email, password: password);
      }
      catch(error){
        //TODO Handle all create Account errors
        return Future.error(error.code);
      }
    });
  }


  static Future<String> getToken(){
    return FirebaseAuth.instance.currentUser().then((user) {
      return user.getIdToken(refresh: false).then((value) {
        return Future.value(value.token);
      });
    });
  }


  static Future<void> logout(){
    return FirebaseAuth.instance.signOut();
  }

}