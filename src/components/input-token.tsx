import React, { memo } from "react";

interface InputTokenProps {
  title?: string;
  value?: string;
  tokenName?: string;
  className?: string;
  balance?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onMax?: () => void;
  disabled?: boolean;
}

function InputToken(props: InputTokenProps) {
  const {
    title,
    value,
    tokenName,
    className,
    balance,
    onChange,
    onMax,
    disabled,
  } = props;
  return (
    <div className={`flex flex-col w-full ${className}`}>
      <div className="flex items-center">
        <p className="xt-sm text-black flex-1">{title}</p>
        {balance && (
          <p className="text-sm text-black/70">
            Balance: <span className="font-semibold">{balance}</span>
          </p>
        )}
      </div>
      <div className="relative flex h-12 rounded-lg border items-center mt-1">
        <input
          disabled={disabled}
          placeholder="Enter Amount"
          className="flex-1 border-none h-full px-3 rounded-lg text-black"
          type="number"
          value={value}
          onChange={onChange}
        />

        <div className="flex items-center absolute right-3">
          {!disabled && (
            <button
              onClick={onMax}
              className="text-white/70 text-sm w-12 h-7 bg-slate-400 rounded-lg"
            >
              Max
            </button>
          )}
          {tokenName && (
            <>
              <div className="h-4 w-px bg-black/20 mx-2" />
              <p className="text-base font-semibold text-black/70">
                {tokenName}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(InputToken);
