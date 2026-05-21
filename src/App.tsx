/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ThemeProvider } from './ThemeContext';
import { I18nProvider } from './I18nContext';
import { Dashboard } from './Dashboard';

export default function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <Dashboard />
      </I18nProvider>
    </ThemeProvider>
  );
}
