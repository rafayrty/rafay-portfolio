import dynamic from 'next/dynamic'

const TerminalNoSSR = dynamic(() => import('@/components/Terminal'), {
  ssr: !!false,
})

export default function Home() {
  return (
    <main>
      <TerminalNoSSR />
    </main>
  );
}
