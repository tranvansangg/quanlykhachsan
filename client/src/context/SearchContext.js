import { createContext, useReducer } from "react";

const INITIAL_STATE = {
  city: undefined,
  dates: [],
  options: {
    adult: undefined,
    children: undefined,
    room: undefined,
  },
  searchHistory: [],
};

export const SearchContext = createContext(INITIAL_STATE);

const SearchReducer = (state, action) => {
  switch (action.type) {
    case "NEW_SEARCH":
      return action.payload;
    case "RESET_SEARCH":
      return INITIAL_STATE;
    case "SET_SEARCH_HISTORY":
      return { ...state, searchHistory: Array.isArray(action.payload) ? action.payload : [] };
    case "ADD_TO_HISTORY":
      const currentHistory = Array.isArray(state.searchHistory) ? state.searchHistory : [];
      return { 
        ...state, 
        searchHistory: [action.payload, ...currentHistory].slice(0, 10) 
      };
    case "CLEAR_HISTORY":
      return { ...state, searchHistory: [] };
    default:
      return state;
  }
};

export const SearchContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(SearchReducer, INITIAL_STATE);

  return (
    <SearchContext.Provider
      value={{
        city: state.city,
        dates: state.dates,
        options: state.options,
        searchHistory: state.searchHistory,
        dispatch,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};




















