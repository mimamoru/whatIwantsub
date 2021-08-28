import React, { createContext, useContext, useState } from "react"

const AuthUserContext = createContext(null)
const AuthOperationContext = createContext({
  signin: (_) => console.error("Providerが設定されていません"),
  signout: () => console.error("Providerが設定されていません")
})

const AuthUserProvider=({ children }) => {
  const [authUser, setAuthUser] = useState(null)
  
  const signin = async (userId) => {
    // await signin() //ログイン処理 DB照合
    setAuthUser({ userId })
  }
  
  const signout = async () => {
    // await signin() //ログアウト処理
    setAuthUser(null)
  }

  return (
    <AuthOperationContext.Provider value={{signin, signout}}>
      <AuthUserContext.Provider value={authUser}>
        { children }
      </AuthUserContext.Provider>
    </AuthOperationContext.Provider>
  )
}

export const useAuthUser = () => useContext(AuthUserContext)
export const useSignin = () => useContext(AuthOperationContext).signin
export const useSignout = () => useContext(AuthOperationContext).signout

export default AuthUserProvider