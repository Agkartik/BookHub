
// import { createContext, useContext, useReducer } from 'react';

// const AppContext = createContext();

// const appReducer = (state, action) => {
//   switch (action.type) {
//     case 'SET_USER':
//       return { ...state, user: action.payload };
//     case 'SET_BOOKS':
//       return { ...state, books: action.payload };
//     case 'SET_LOADING':
//       return { ...state, loading: action.payload };
//     default:
//       return state;
//   }
// };

// const initialState = {
//   user: null,
//   books: [],
//   loading: false,
// };

// export function AppContextProvider({ children }) {
//   const [state, dispatch] = useReducer(appReducer, initialState);

//   const setUser = (user) => {
//     dispatch({ type: 'SET_USER', payload: user });
//   };

//   const setBooks = (books) => {
//     dispatch({ type: 'SET_BOOKS', payload: books });
//   };

//   const setLoading = (loading) => {
//     dispatch({ type: 'SET_LOADING', payload: loading });
//   };

//   const value = {
//     ...state,
//     setUser,
//     setBooks,
//     setLoading,
//   };

//   return (
//     <AppContext.Provider value={value}>
//       {children}
//     </AppContext.Provider>
//   );
// }

// export function useAppContext() {
//   const context = useContext(AppContext);
//   if (!context) {
//     throw new Error('useAppContext must be used within an AppContextProvider');
//   }
//   return context;
// }