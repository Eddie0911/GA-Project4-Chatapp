export function Avatar({userId, username,online}){
    const colors = ['bg-red-200','bg-green-200','bg-purple-200',
                    'bg-blue-200','bg-yellow-200', 'bg-teal-200'];
    const userIdBase10 = parseInt(userId,16);
    const colorIndex = userIdBase10 % colors.length;
    const color = colors[colorIndex];
    return (
        <div className={"rounded-full relative flex items-center justify-center " + color}>
            <div className="w-full opacity-70">
                <div className="w-8 h-8 flex items-center justify-center">{username[0]}</div>
                {online && (
                    <div className="absolute w-2 h-2 bg-green-700 bottom-0 right-0 rounded-full border border-white"></div>
                )}
                {!online && (
                    <div className="absolute w-2 h-2 bg-gray-700 bottom-0 right-0 rounded-full border border-white"></div>
                )}
            </div>
        </div>
    )
}