'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

export default function Breadcrumbs() {
  const pathname = usePathname();

  return (
    <div className="breadcrumbs text-sm my-5">
      <ul>
        <li>
          <Link
            href="/"
            className={clsx({
              'text-blue-400 font-semibold': pathname === '/',
              'text-gray-600': pathname !== '/',
            })}
          >
            acceuil
          </Link>
        </li>
        <li>
          <Link
            href="/files"
            className={clsx({
              'text-blue-400 font-semibold': pathname === '/files',
              'text-gray-600': pathname !== '/files',
            })}
          >
            mes fichiers
          </Link>
        </li>
   
      </ul>
    </div>
  );
}
