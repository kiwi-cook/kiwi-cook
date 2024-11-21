class ChatStateEnum(str):
    not_started = "not_started"
    servings = "servings"
    ingredients = "ingredients"
    recipe_suggestions = "recipe_suggestions"
    finished = "finished"

    _state_order = [
        not_started,
        servings,
        ingredients,
        recipe_suggestions,
        finished,
    ]

    @staticmethod
    def get_next_of(state: str) -> str:
        return ChatStateEnum._state_order[
            (ChatStateEnum._state_order.index(state) + 1)
            % len(ChatStateEnum._state_order)
            ]

    @staticmethod
    def get_previous_of(state: str) -> str:
        return ChatStateEnum._state_order[
            (ChatStateEnum._state_order.index(state) - 1)
            % len(ChatStateEnum._state_order)
            ]
