export const getUserFromLocalStorage = () => {
  try {
    const storedUser = localStorage.getItem('userData');
    if (!storedUser) return null;
    const parsedUser = JSON.parse(storedUser);
     return parsedUser;
  } 
  catch (error) {
    console.error("Failed to parse user from localStorage:", error);
    return null;
  }
};



export const getAdminFromLocalStorage = () => {
  try {
    const storedAdmin = localStorage.getItem('adminData');
    if (!storedAdmin) return null;
    const parsedAdmin = JSON.parse(storedAdmin);
    return parsedAdmin;
  } catch (error) {
    console.error("Failed to parse admin from localStorage:", error);
    return null;
  }
};

