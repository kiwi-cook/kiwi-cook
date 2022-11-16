package main

type User struct {
	ID        int    `json:"id"`
	Username  string `json:"username"`
	Password  string `json:"password"`
	UserItems []int  `json:"userItems"`
}

var users = []User{
	{
		ID:       1,
		Username: "test",
		Password: "test",
	},
}

// AddUser adds new user to the list of users
// and returns the newly added user
func AddUser(username string, password string) User {
	newUser := User{
		ID:       len(users) + 1,
		Username: username,
		Password: password,
	}
	users = append(users, newUser)
	return newUser
}

// UpdateUser is used to update a user by in the database
func UpdateUser(updatedUser User) bool {
	for user_index, user := range users {
		if user.ID == updatedUser.ID {
			users[user_index] = updatedUser
			return true
		}
	}
	return false
}

// FindUserById returns the user with the given id
func FindUserById(id int) User {
	for _, user := range users {
		if user.ID == id {
			return user
		}
	}
	return User{}
}

// FindUserByUsername returns the user with the given username
func FindUserByUsername(username string) User {
	for _, user := range users {
		if user.Username == username {
			return user
		}
	}
	return User{}
}

// AddEquipment
func AddEquipmentToUser(id int, equipment []int) User {
	user := FindUserById(id)
	user.UserItems = append(user.UserItems, equipment...)
	UpdateUser(user)
	return user
}
