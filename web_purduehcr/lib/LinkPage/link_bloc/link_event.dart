import 'package:equatable/equatable.dart';
import 'package:flutter/material.dart';

abstract class LinkEvent extends Equatable {
  const LinkEvent();
}

class LinkInitialize extends LinkEvent {
  const LinkInitialize();
  @override
  List<Object> get props => [];
}

class CreateLink extends LinkEvent {
  final String description;
  final bool enabled;
  final bool singleUse;
  final int pointTypeId;
  final bool shouldDismissDialog;

  const CreateLink({this.description, this.enabled, this.singleUse, this.pointTypeId, this.shouldDismissDialog});

  @override
  List<Object> get props => [description, enabled, singleUse, pointTypeId];


}

class LinkDisplayedMessage extends LinkEvent {
  LinkDisplayedMessage();

  @override
  List<Object> get props => [];
}
