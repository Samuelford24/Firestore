import 'dart:core';

import 'package:meta/meta.dart';

class Link {

  static const String ARCHIVED = "archived";
  static const String ENABLED = "enabled";
  static const String CREATOR_ID = "creatorId";
  static const String DESCRIPTION = "description";
  static const String POINT_ID = "pointId";
  static const String POINT_TYPE_NAME = "pointTypeName";
  static const String POINT_TYPE_DESCRIPTION = "pointTypeDescription";
  static const String POINT_TYPE_VALUE = "pointTypeValue";
  static const String SINGLE_USE = "singleUse";
  static const String ID = "id";

  bool archived;
  bool enabled;
  String creatorId;
  String description;
  int pointTypeId;
  String pointTypeName;
  String pointTypeDescription;
  int pointTypeValue;
  String id;
  bool singleUse;
  Link({@required this.archived, @required this.enabled, @required this.creatorId,
  @required this.description, @required this.pointTypeId, @required this.id,
  @required this.singleUse, @required this.pointTypeName, @required this.pointTypeDescription,
    @required this.pointTypeValue
  });

  factory Link.fromJson(Map<String, dynamic> json){
    return Link(
      archived: json[ARCHIVED],
      enabled: json[ENABLED],
      creatorId: json[CREATOR_ID],
      description: json[DESCRIPTION],
      pointTypeId: json[POINT_ID],
      id: json[ID],
      singleUse: json[SINGLE_USE],
      pointTypeName: json[POINT_TYPE_NAME],
      pointTypeDescription: json[POINT_TYPE_DESCRIPTION],
      pointTypeValue: json[POINT_TYPE_VALUE]
    );
  }

  String generateURL(){
    return "hcrpoint://addpoints/"+this.id;
  }

  String generateIOSLink(){
    return "hcrpoint://addpoints/"+this.id;
  }

  String generateAndroidLink(){
    return "intent://addpoints/"+this.id+"#Intent;scheme=hcrpoint;package=com.hcrpurdue.jason.hcrhousepoints;end";
  }

  Map<String, dynamic> getUpdateJson() {
    Map<String, dynamic> data = Map();
    data["link_id"] = id;
    data[ARCHIVED] = archived;
    data[ENABLED] = enabled;
    data[DESCRIPTION] = description;
    data[SINGLE_USE] = singleUse;
    return data;
  }

}