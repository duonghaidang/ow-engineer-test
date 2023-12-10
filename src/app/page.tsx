"use client";
import InputToken from "@/components/input-token";
import SelectShape, { SelectData } from "@/components/select-shape";
import {
  ethers,
  BrowserProvider,
  formatEther,
  formatUnits,
  parseEther,
  parseUnits,
} from "ethers";
import { useCallback, useEffect, useMemo, useState } from "react";
import erc20Abi from "@/abis/json/ERC20.json";
import lbFactoryAbi from "@/abis/json/LBFactory.json";
import lbRouterAbi from "@/abis/json/LBRouter.json";
import lbPairAbi from "@/abis/json/LBPair.json";
import pancakeAbi from "@/abis/json/Pancake.json";
import { getLiquidityConfig } from "@/utils/contract";
import { LiquidityDistribution } from "@/types/pair";
import { isNumber } from "lodash";

const SHAPES: SelectData[] = [
  {
    id: LiquidityDistribution.SPOT.toString(),
    label: "Spot",
  },
  {
    id: LiquidityDistribution.CURVE.toString(),
    label: "Curve",
  },
  {
    id: LiquidityDistribution.BID_ASK.toString(),
    label: "Bid-Ask",
  },
];

const ARBITRUM = 42161;
const WETH_ADDRESS = "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1";
const USDC_ADDRESS = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831";
const VAULT_USDC_ADDRESS = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831";
const LB_FACTORY_ADDRESS = "0x8e42f2F4101563bF679975178e880FD87d3eFd4e";
const LB_ROUTER_ADDRESS = "0xb4315e873dBcf96Ffd0acd8EA43f689D8c20fB30";
const PANCAKE_ADDRESS = "0x8cFe327CEc66d1C090Dd72bd0FF11d690C33a2Eb";

export default function Home() {
  const [shape, setShape] = useState<string>(SHAPES.at(0)?.id || "");
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [ethBalance, setETHBalance] = useState(0n);
  const [usdcBalance, setUSDCBalance] = useState(0n);
  const [walletAddress, setWalletAddress] = useState("");
  const [usdcApproveToken, setUSDCApproveToken] = useState(0n);

  const [ethAmount, setETHAmount] = useState("");
  const [usdcAmount, setUSDCAmount] = useState("");
  const [allowedAmountsSlippage, setAllowedAmountsSlippage] = useState("50");
  const [binStep, setBinStep] = useState(15);
  const [idSlippage, setIdSlippage] = useState(5);
  const [activeId, setActiveId] = useState(0n);

  const needApproveToken = useMemo(
    () => parseUnits(usdcAmount || "0", 6) > usdcApproveToken,
    [usdcAmount, usdcApproveToken]
  );

  const isConnectWallet = useMemo(() => !!walletAddress, [walletAddress]);
  const isValidETH = useMemo(
    () => !!ethAmount && isNumber(Number(ethAmount)),
    [ethAmount]
  );
  const isValidUSDC = useMemo(
    () => !!usdcAmount && isNumber(Number(usdcAmount)),
    [usdcAmount]
  );
  const isOverETH = useMemo(
    () => parseEther(ethAmount || "0") > ethBalance,
    [ethAmount, ethBalance]
  );
  const isOverUSDC = useMemo(
    () => parseUnits(usdcAmount || "0", 6) > usdcBalance,
    [usdcAmount, usdcBalance]
  );

  const buttonDisabled = useMemo(() => {
    return (
      isConnectWallet &&
      (!isValidETH || isOverETH || !isValidUSDC || isOverUSDC)
    );
  }, [isConnectWallet, isOverETH, isOverUSDC, isValidETH, isValidUSDC]);

  const buttonTitle = useMemo(() => {
    if (!isConnectWallet) return "Connect Wallet";
    if (!isValidETH) return "Enter ETH amount";
    if (isOverETH) return "Not enough ETH";
    if (!isValidUSDC) return "Enter USDC amount";
    if (isOverUSDC) return "Not enough USDC";

    return "Add liquidity";
  }, [isConnectWallet, isOverETH, isOverUSDC, isValidETH, isValidUSDC]);

  const onGetBalance = useCallback(async (_provider: BrowserProvider) => {
    if (!_provider) return;
    const signer = await _provider.getSigner();
    const usdcContract = new ethers.Contract(USDC_ADDRESS, erc20Abi, signer);
    setETHBalance(await _provider.getBalance(signer.address));
    setUSDCBalance(await usdcContract.balanceOf(signer.address));
  }, []);

  const onConnectWallet = useCallback(async () => {
    try {
      if (!window.ethereum) {
        console.log("MetaMask not installed;");
        return;
      }

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const provider = new ethers.BrowserProvider(window.ethereum);
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: ethers.toBeHex(ARBITRUM) }],
      });
      const signer = await provider.getSigner();

      const usdcContract = new ethers.Contract(USDC_ADDRESS, erc20Abi, signer);
      const lbFactoryContract = new ethers.Contract(
        LB_FACTORY_ADDRESS,
        lbFactoryAbi,
        signer
      );
      const lpPairAddress = await lbFactoryContract.getLBPairInformation(
        WETH_ADDRESS,
        USDC_ADDRESS,
        binStep
      );
      const lbPairContract = new ethers.Contract(
        lpPairAddress.LBPair,
        lbPairAbi,
        signer
      );

      setProvider(provider);
      setWalletAddress(signer.address);
      setActiveId(await lbPairContract.getActiveId());
      setUSDCApproveToken(
        await usdcContract.allowance(signer.address, VAULT_USDC_ADDRESS)
      );
      onGetBalance(provider);
    } catch (error) {
      console.log(`Error:`, error);
    }
  }, [binStep, onGetBalance]);

  const onSelectShape = useCallback((item: SelectData) => {
    setShape(item.id);
  }, []);
  const onChangeETHAmount = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setETHAmount(event.target.value);
    },
    []
  );
  const onMaxETHAmount = useCallback(() => {
    setETHAmount(Number(formatEther(ethBalance.toString())).toString());
  }, [ethBalance]);
  const onChangeUSDCAmount = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setUSDCAmount(event.target.value);
    },
    []
  );
  const onMaxUSDCAmount = useCallback(() => {
    setUSDCAmount(Number(formatUnits(usdcBalance, 6)).toString());
  }, [usdcBalance]);
  const getMinTokenAmount = useCallback(
    (amount: bigint, allowedAmountsSlippage: number) => {
      return (amount * BigInt(10000 - allowedAmountsSlippage)) / BigInt(10000);
    },
    []
  );

  const onAddLiquidity = useCallback(async () => {
    const distribution = Object.values(LiquidityDistribution).find(
      (i) => i.toString() === shape
    );
    const { deltaIds, distributionX, distributionY } = getLiquidityConfig(
      distribution as LiquidityDistribution
    );
    const currentTimeInSec = Math.floor(new Date().getTime() / 1000);
    const deadline = currentTimeInSec + 3600;

    const signer = await provider!.getSigner();
    const lbRouterContract = new ethers.Contract(
      LB_ROUTER_ADDRESS,
      lbRouterAbi,
      signer
    );

    const tx = await lbRouterContract.addLiquidityNATIVE(
      {
        tokenX: WETH_ADDRESS,
        tokenY: USDC_ADDRESS,
        binStep: binStep,
        amountX: parseEther(ethAmount),
        amountY: parseUnits(usdcAmount, 6),
        amountXMin: getMinTokenAmount(
          parseEther(ethAmount),
          Number(allowedAmountsSlippage)
        ),
        amountYMin: getMinTokenAmount(
          parseUnits(usdcAmount, 6),
          Number(allowedAmountsSlippage)
        ),
        activeIdDesired: activeId,
        idSlippage: idSlippage,
        deltaIds: deltaIds,
        distributionX: distributionX,
        distributionY: distributionY,
        to: walletAddress,
        refundTo: walletAddress,
        deadline,
        gasLimit: BigInt(7920027),
      },
      {
        gasLimit: BigInt(7920027),
        value: parseEther(ethAmount),
      }
    );

    setETHAmount("");
    setUSDCAmount("");
    provider && onGetBalance(provider);
    alert("Add liquidity successfully!");
  }, [
    activeId,
    allowedAmountsSlippage,
    binStep,
    ethAmount,
    getMinTokenAmount,
    idSlippage,
    onGetBalance,
    provider,
    shape,
    usdcAmount,
    walletAddress,
  ]);

  const onApproveToken = useCallback(async () => {
    const signer = await provider?.getSigner();
    const usdcContract = new ethers.Contract(USDC_ADDRESS, erc20Abi, signer);
    const tasks = [];

    if (parseUnits(usdcAmount, 6) > usdcApproveToken) {
      tasks.push(
        usdcContract
          .approve(LB_ROUTER_ADDRESS, parseUnits(usdcAmount, 6))
          .then(() => {
            setUSDCApproveToken(parseUnits(usdcAmount, 6));
          })
      );
    }
    await Promise.all(tasks);
  }, [provider, usdcAmount, usdcApproveToken]);

  return (
    <main className="flex min-h-screen flex-col p-6 bg-white">
      <p className="text-lg font-semibold text-black">Deposit Liquidity</p>
      <InputToken
        tokenName="ETH"
        className="mt-4"
        balance={
          isConnectWallet
            ? Number(formatEther(ethBalance.toString())).toString()
            : "..."
        }
        value={ethAmount}
        onChange={onChangeETHAmount}
        onMax={onMaxETHAmount}
      />
      <InputToken
        tokenName="USDC"
        className="mt-4"
        balance={
          isConnectWallet
            ? Number(formatUnits(usdcBalance, 6)).toString()
            : "..."
        }
        value={usdcAmount}
        onChange={onChangeUSDCAmount}
        onMax={onMaxUSDCAmount}
      />
      <p className="text-lg font-semibold text-black mt-8">
        Choose Liquidity Shape
      </p>
      <SelectShape
        className="mt-4"
        value={shape}
        data={SHAPES}
        onSelectItem={onSelectShape}
      />
      <InputToken
        title="Bin step:"
        value={binStep.toString()}
        className="mt-4"
        disabled={true}
      />
      {/* <div className="flex mt-4">
        <InputToken
          tokenName="ETH"
          title="Min Price:"
          className="flex-1 mr-2"
          onChange={() => {}}
        />
        <InputToken
          tokenName="ETH"
          title="Max Price:"
          className="flex-1"
          onChange={() => {}}
        />
      </div> */}

      <button
        disabled={buttonDisabled}
        onClick={
          isConnectWallet
            ? needApproveToken
              ? onApproveToken
              : onAddLiquidity
            : onConnectWallet
        }
        className={`w-full h-12 bg-blue-400 rounded-lg mt-6 text-white ${
          buttonDisabled ? "bg-gray-400" : ""
        }`}
      >
        {buttonTitle}
      </button>
    </main>
  );
}
export const runtime = "edge";
