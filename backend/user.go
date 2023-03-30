package main

type User struct {
	ID             string `json:"_id" bson:"_id"`
	Username       string `json:"username" bson:"username"`
	Authentication string `json:"-" bson:"authentication"`
}
