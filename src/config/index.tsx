import { cookieStorage, createStorage } from '@wagmi/core'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { mainnet, arbitrum } from '@reown/appkit/networks'

// Get projectId from https://cloud.reown.com
// It's recommended to store your projectId in an environment variable
export const projectId = "37ff5b98cdf7fe486bbf826ff5f148a5"

if (!projectId) {
  // Remind the user to add their Project ID
  console.warn('Reown AppKit: Project ID is not defined. Please add NEXT_PUBLIC_PROJECT_ID to your .env.local file. You can get a Project ID from https://cloud.reown.com')
  // throw new Error('Project ID is not defined') // You might want to throw an error in production
}

export const networks = [mainnet, arbitrum]

//Set up the Wagmi Adapter (Config)
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage
  }),
  ssr: true,
  projectId: projectId || "", // Use the projectId from process.env
  networks
})

export const config = wagmiAdapter.wagmiConfig
