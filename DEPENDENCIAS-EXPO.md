# Recuperação das dependências do Expo SDK 57

Se houver conflito `ERESOLVE`, pare o Expo e execute no PowerShell, na raiz do projeto:

```powershell
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item package-lock.json -Force -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .expo -ErrorAction SilentlyContinue
npm cache verify
npm install
npx expo install --fix
npx expo-doctor
npx expo start --tunnel --clear
```

O projeto fixa `react` e `react-dom` em 19.2.3 e `react-native-worklets` em 0.10.1 para evitar os conflitos observados no SDK 57. `@expo/ngrok` também é instalado localmente como dependência de desenvolvimento.
