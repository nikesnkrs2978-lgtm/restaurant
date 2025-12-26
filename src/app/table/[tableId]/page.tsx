import CustomerApp from '@/components/CustomerApp'

export default async function MenuPage({
    params,
}: {
    params: Promise<{ tableId: string }>
}) {
    const { tableId } = await params
    return <CustomerApp tableId={tableId} />
}
