declare global {
	interface ImportMetaEnv {
		readonly VITE_EDITION?: 'simulator';
	}

	namespace App {
		interface PageState {
			historyOpenedInApp?: boolean;
		}
	}
}

export {};
