// Package src
/*
Copyright © 2023 JOSEF MUELLER
*/
package main

import (
	"github.com/gofiber/fiber/v2"
	"math/rand"
)

func responseJSON(response interface{}, isError bool) fiber.Map {
	return fiber.Map{"response": response, "error": isError}
}

// Success returns a 200 success with a message
func Success(context *fiber.Ctx, response interface{}) error {
	return context.Status(fiber.StatusOK).JSON(responseJSON(response, false))
}

// NotFoundError returns a 404 error with a funny message
func NotFoundError(context *fiber.Ctx) error {
	return context.Status(fiber.StatusNotFound).JSON(responseJSON(funnyNotFoundMessage(), true))
}

// ErrorMessage returns a 500 error with a message
func ErrorMessage(context *fiber.Ctx, message string) error {
	return context.Status(fiber.StatusInternalServerError).JSON(responseJSON(message, true))
}

// ServerError returns a 500 error with a message
func ServerError(context *fiber.Ctx) error {
	return ErrorMessage(context, "Internal Server Error")
}

func funnyNotFoundMessage() string {
	funnyMessages := []string{
		"The page is on a lunch break. It went out for tacos without telling us. Hungry much?",
		"Oh no! The page is lost in the sauce. Literally. We're sending a rescue team with spaghetti.",
		"The page is off searching for the perfect pizza. Priorities, right?",
		"Culinary Catastrophe: The page got eaten by the cookie monster. RIP.",
		"Well, this is egg-stremely awkward. The page got poached and is now brunching in a secret location.",
		"The page is on a dessert island. Yes, it's a sweet escape.",
		"It's lost in the spice aisle, searching for its sense of flavor. Too much paprika, not enough page.",
		"The page is off having a picnic with other missing pages. No invitation? Rude!",
		"Oops! The page is in a food coma. Too many bytes, not enough bites.",
		"The page is baking cookies. Don't worry; it'll crumble back to reality soon.",
		"Lost page alert! It's stuck in a corn maze, trying to find its way back to the server farm.",
		"Menu not found. The page is dining at a digital restaurant. Hopefully, the servers are faster than ours.",
		"The page is on a coffee break, contemplating the meaning of espresso. Deep thoughts in a tiny cup.",
		"The page is on a sushi adventure. It heard the internet is full of raw data, so it's exploring the menu.",
		"Uh-oh! The page is on a quest for the legendary chocolate fountain. We hope it doesn't drown in sweetness.",
		"The page is at a food truck festival. It couldn't resist the call of the mobile kitchens.",
		"It's off foraging for Wi-Fi mushrooms in the digital forest. Edible or not, who knows?",
		"The page is in a noodle incident. Don't ask what happened; it's a saucy story.",
		"Oh crumbs! The page got crumpled in the cookie jar. It's having an existential crisis in there.",
		"The page is on a burger pilgrimage. It believes in the power of a good patty.",
	}

	randomIndex := rand.Intn(len(funnyMessages))
	return funnyMessages[randomIndex]
}

func funnyErrorMessage() string {
	funnyMessages := []string{
		"Looks like you're trying to break the internet again. Please stop, it's already had a rough year.",
		"Oh Lord, we're being hacked! 😱 Call the FBI!",
		"Hello, this is Microsoft Tech support. How can I help you?",
		"Beep boop. This is an error. Boop beep! 🤖",
		"Oh My God! You killed Kenny!",
		"Something happened. We're not sure what, but something happened.",
		"Looks like you're barking up the wrong API! Try another endpoint.",
		"Oh no! The server is feeling a bit overwhelmed. Give it a minute to catch its breath.",
		"Whoops! It seems our hamsters powering the server just took a coffee break. Try again in a few minutes.",
		"ERROR 404: Wisdom not found. Please try a different endpoint.",
		"Looks like the squirrels running our database went on strike. Try again later.",
		"We're sorry, but your request has been lost in space. Literally. Please try again.",
		"Error: Cannot divide by zero. We're pretty sure even the universe can't handle that.",
		"Uh-oh! We couldn't find what you were looking for. Maybe try using a telescope?",
		"Error: Insufficient caffeine levels detected. Our developers are working on a fix.",
		"Oops! Our servers seem to be experiencing some technical difficulties. But don't worry, we've sent in the clowns to fix it.",
		"Error: Your request was a little too wild for our servers to handle. Please try again with a tamer request.",
		"We apologize for the inconvenience, but our server is currently on vacation. Try again when it gets back.",
		"Oops! Looks like our developers forgot to pay the internet bill. Try again later when we have Wi-Fi again.",
		"Error: Your request made our servers go bananas. Maybe try a less fruity approach?",
		"Uh-oh, looks like we spilled coffee on our servers again. Please stand by while we clean up the mess.",
		"We're sorry, but the data you're looking for seems to have gone missing. Maybe it eloped with a unicorn?",
		"Error: Our hamsters fell off their wheel and the server crashed. We're currently coaxing them back on track.",
		"Looks like you're trying to break the internet again. Please stop, it's already had a rough year.",
		"Error: We couldn't find the page you were looking for. Maybe try turning it off and on again?",
		"We apologize, but our servers are currently in a time-out. They need to think about what they've done.",
		"Error: Our servers are currently experiencing a moment of clarity. Please try again later.",
		"Error: Looks like you sent the wrong request. Don't worry, we won't tell anyone.",
		"Whoops! You just sent a request to a non-existent endpoint. Did you mean to do that or did your cat walk over the keyboard again?",
		"Oops, you seem to have sent a request to the wrong universe. Better luck next time, Interdimensional Voyager.",
		"Error: You sent a request that was too hot to handle. Please let it cool down before trying again.",
		"We're sorry, but the request you sent has caused our servers to burst into song. Please try a more appropriate request next time.",
	}

	randomIndex := rand.Intn(len(funnyMessages))
	return funnyMessages[randomIndex]
}
