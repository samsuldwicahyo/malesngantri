const BrandMark = ({ className = 'w-8 h-8', label = 'M' }) => {
    return (
        <div
            className={`${className} bg-amber-500 rounded-lg rotate-12 flex items-center justify-center font-black text-black border-2 border-white/10 shadow-[0_0_20px_rgba(245,158,11,0.3)]`}
            aria-hidden="true"
        >
            {label}
        </div>
    );
};

export default BrandMark;
